import os
import sqlite3
import random
import string
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from datetime import datetime, timedelta
from typing import cast
from flask_mail import Mail, Message

# 初始化Flask应用
app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # 生成随机密钥

# finaldemo项目的URL配置
FINALDEMO_URL = "http://localhost:5001/"

# QQ邮箱SMTP配置
app.config['MAIL_SERVER'] = 'smtp.qq.com'  # QQ邮箱SMTP服务器
app.config['MAIL_PORT'] = 465  # QQ邮箱使用SSL端口465
app.config['MAIL_USE_SSL'] = True  # QQ邮箱使用SSL
app.config['MAIL_USE_TLS'] = False  # 不使用TLS
app.config['MAIL_USERNAME'] = '1577418482@qq.com'  # 替换为您的QQ邮箱
app.config['MAIL_PASSWORD'] = 'jtxqxfobatvlfgac'  # 替换为您的QQ邮箱授权码，不是QQ密码
app.config['MAIL_DEFAULT_SENDER'] = '1577418482@qq.com'  # 替换为您的QQ邮箱

mail = Mail(app)

# 存储验证码的字典，格式为 {邮箱: (验证码, 过期时间)}
verification_codes = {}

# 添加全局上下文处理器
@app.context_processor
def inject_now():
    return {'now': datetime.now}

# 确保存在templates和static文件夹
os.makedirs('templates', exist_ok=True)
os.makedirs('static', exist_ok=True)

# 数据库初始化
def init_db():
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # 获取当前表结构
    cursor.execute("PRAGMA table_info(users)")
    columns = [column[1] for column in cursor.fetchall()]
    
    # 如果表不存在，创建新表
    if not columns:
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE,
            email_verified INTEGER DEFAULT 0
        )
        ''')
    # 如果表存在但没有email列，添加email列
    elif 'email' not in columns:
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN email TEXT UNIQUE")
            print("成功添加email列到users表")
        except sqlite3.OperationalError as e:
            print(f"添加email列时出错: {e}")
    
    # 如果表存在但没有email_verified列，添加email_verified列
    if 'email_verified' not in columns:
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0")
            print("成功添加email_verified列到users表")
        except sqlite3.OperationalError as e:
            print(f"添加email_verified列时出错: {e}")
    
    # 如果表存在但没有username列，添加username列（确保完整性）
    if columns and 'username' not in columns:
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN username TEXT UNIQUE NOT NULL DEFAULT 'unknown'")
            print("成功添加username列到users表")
        except sqlite3.OperationalError as e:
            print(f"添加username列时出错: {e}")
    
    # 导入现有数据
    try:
        with open('data.txt', 'r') as file:
            lines = file.readlines()
            
            # 跳过标题行
            for line in lines[1:]:
                if line.strip():  # 确保不是空行
                    fields = line.strip().split(',')
                    if len(fields) >= 2:
                        username = fields[0]
                        password = fields[1]
                        
                        # 检查用户是否已存在
                        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
                        if not cursor.fetchone():
                            # 对密码进行哈希处理后存储
                            hashed_password = generate_password_hash(password)
                            cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)",
                                        (username, hashed_password))
    except Exception as e:
        print(f"导入数据时出错: {e}")
    
    conn.commit()
    conn.close()

# 验证登录函数
def verify_login(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    
    conn.close()
    
    try:
        if result and check_password_hash(result[0], password):
            return True
    except ValueError as e:
        print(f"密码验证错误: {e}")
        # 如果是不支持的哈希类型错误，尝试直接比较密码（不安全，仅用于兼容旧数据）
        if "unsupported hash type" in str(e):
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            cursor.execute("SELECT password FROM users WHERE username = ? AND password = ?", (username, password))
            direct_match = cursor.fetchone()
            conn.close()
            return bool(direct_match)
    return False

# 发送验证邮件
def send_verification_email(email, username):
    # 生成6位随机验证码
    code = ''.join(random.choices(string.digits, k=6))
    # 设置验证码有效期为10分钟
    expiration = datetime.now() + timedelta(minutes=10)
    verification_codes[email] = (code, expiration)
    
    # 发送验证码邮件
    try:
        msg = Message("邮箱验证码", recipients=[email])
        msg.body = f"亲爱的 {username}，\n\n您的邮箱验证码是：{code}，有效期10分钟。\n\n请在验证页面输入此验证码以完成邮箱验证。\n\n如果这不是您的操作，请忽略此邮件。"
        mail.send(msg)
        return True, "验证码已发送"
    except Exception as e:
        print(f"发送邮件失败：{str(e)}")
        return False, f"发送邮件失败：{str(e)}"

# 注册新用户
def register_user(username, password, email=None):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # 首先检查用户名是否已存在
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    if cursor.fetchone():
        conn.close()
        return False, "用户名已存在"
    
    # 如果提供了邮箱，检查邮箱是否已存在
    if email:
        # 检查表中是否有email列
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'email' in columns:
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            if cursor.fetchone():
                conn.close()
                return False, "邮箱已存在"
    
    try:
        hashed_password = generate_password_hash(password)
        
        # 检查表中是否有email列
        cursor.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'email' in columns:
            cursor.execute("INSERT INTO users (username, password, email, email_verified) VALUES (?, ?, ?, ?)",
                        (username, hashed_password, email, 0))
        else:
            cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)",
                        (username, hashed_password))
            
        conn.commit()
        conn.close()
        
        # 如果提供了邮箱，发送验证邮件
        if email:
            send_verification_email(email, username)
        
        return True, "注册成功"
    except Exception as e:
        print(f"注册用户时出错: {e}")
        conn.close()
        return False, f"注册失败: {str(e)}"

# 路由：主页
@app.route('/')
def index():
    return render_template('index.html')

# 路由：登录
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if verify_login(username, password):
            session['username'] = username
            flash('登录成功！', 'success')
            # 确保使用绝对URL重定向到知识图谱系统
            try:
                return redirect(FINALDEMO_URL, code=302)
            except Exception as e:
                print(f"重定向错误: {e}")
                # 如果重定向失败，尝试使用硬编码的URL
                return redirect("http://localhost:5001/", code=302)
        else:
            flash('用户名或密码错误！', 'error')
    
    return render_template('login.html')

# 路由：注册
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        email = request.form.get('email')
        
        if not username or not password:
            flash('用户名和密码不能为空！', 'error')
        elif password != confirm_password:
            flash('两次输入的密码不一致！', 'error')
        else:
            success, message = register_user(username, password, email)
            if success:
                flash('注册成功，请登录！如果您提供了邮箱，请查收验证邮件。', 'success')
                return redirect(url_for('login'))
            else:
                flash(message, 'error')
    
    return render_template('register.html')

# 路由：邮箱验证
@app.route('/verify_email', methods=['GET', 'POST'])
def verify_email():
    if 'username' not in session:
        flash('请先登录！', 'error')
        return redirect(url_for('login'))
    
    username = session['username']
    
    # 获取用户邮箱
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT email, email_verified FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    conn.close()
    
    if not result or not result[0]:
        flash('您的账户未绑定邮箱！', 'error')
        return redirect(url_for('dashboard'))
    
    email = result[0]
    email_verified = result[1]
    
    if email_verified:
        flash('您的邮箱已验证！', 'success')
        return redirect(url_for('dashboard'))
    
    if request.method == 'POST':
        verification_code = request.form.get('verification_code')
        
        if email in verification_codes:
            code, expiration = verification_codes[email]
            
            if datetime.now() > expiration:
                flash('验证码已过期，请重新获取！', 'error')
            elif verification_code != code:
                flash('验证码错误！', 'error')
            else:
                # 更新邮箱验证状态
                conn = sqlite3.connect('users.db')
                cursor = conn.cursor()
                cursor.execute("UPDATE users SET email_verified = 1 WHERE username = ?", (username,))
                conn.commit()
                conn.close()
                
                # 清除验证码
                del verification_codes[email]
                
                flash('邮箱验证成功！', 'success')
                return redirect(url_for('dashboard'))
        else:
            flash('请先获取验证码！', 'error')
    
    return render_template('verify_email.html', email=email)

# 路由：重新发送验证邮件
@app.route('/resend_verification')
def resend_verification():
    if 'username' not in session:
        flash('请先登录！', 'error')
        return redirect(url_for('login'))
    
    username = session['username']
    
    # 获取用户邮箱
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT email FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    conn.close()
    
    if not result or not result[0]:
        flash('您的账户未绑定邮箱！', 'error')
        return redirect(url_for('dashboard'))
    
    email = result[0]
    
    success, message = send_verification_email(email, username)
    if success:
        flash('验证码已重新发送到您的邮箱，请查收！', 'success')
    else:
        flash(message, 'error')
    
    return redirect(url_for('verify_email'))

# 路由：用户仪表板
@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        flash('请先登录！', 'error')
        return redirect(url_for('login'))
    
    username = session['username']
    
    # 获取用户邮箱和验证状态
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    cursor.execute("SELECT email, email_verified FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    conn.close()
    
    email = None
    email_verified = False
    
    if result and result[0]:
        email = result[0]
        email_verified = bool(result[1])
    
    return render_template('dashboard.html', username=username, email=email, email_verified=email_verified)

# 路由：退出登录
@app.route('/logout')
def logout():
    session.pop('username', None)
    flash('您已成功退出登录！', 'success')
    return redirect(url_for('index'))

# 路由：修改密码
@app.route('/change_password', methods=['GET', 'POST'])
def change_password():
    if 'username' not in session:
        flash('请先登录！', 'error')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        old_password = request.form.get('old_password')
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')
        username = session['username']

        # 校验原密码
        conn = sqlite3.connect('users.db')
        cursor = conn.cursor()
        cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
        result = cursor.fetchone()
        db_password: str = ''
        if result is not None:
            value = result[0]
            if isinstance(value, str):
                db_password = value
            elif value is not None:
                db_password = str(value)
        assert isinstance(db_password, str)  # 明确告诉类型检查器这是字符串
        if not db_password or not check_password_hash(db_password, old_password):  # type: ignore
            conn.close()
            flash('原密码错误！', 'error')
            return render_template('change_password.html')
        if not new_password or not confirm_password:
            conn.close()
            flash('新密码不能为空！', 'error')
            return render_template('change_password.html')
        if new_password != confirm_password:
            conn.close()
            flash('两次输入的新密码不一致！', 'error')
            return render_template('change_password.html')
        # 更新密码
        new_hashed = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password = ? WHERE username = ?", (new_hashed, username))
        conn.commit()
        conn.close()
        flash('密码修改成功，请重新登录！', 'success')
        session.pop('username', None)
        return redirect(url_for('login'))
    return render_template('change_password.html')

# 路由：忘记密码
@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    show_verification = False
    email = request.args.get('email', '')
    
    if request.method == 'POST':
        email = request.form.get('email', '')
        verification_code = request.form.get('verification_code', '')
        new_password = request.form.get('new_password', '')
        confirm_password = request.form.get('confirm_password', '')
        
        # 如果没有提交验证码，说明是第一步，发送验证码
        if not verification_code:
            # 检查邮箱是否存在
            conn = sqlite3.connect('users.db')
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
            user = cursor.fetchone()
            conn.close()
            
            if user:
                # 生成6位随机验证码
                code = ''.join(random.choices(string.digits, k=6))
                # 设置验证码有效期为10分钟
                expiration = datetime.now() + timedelta(minutes=10)
                verification_codes[email] = (code, expiration)
                
                # 发送验证码邮件
                try:
                    msg = Message("密码重置验证码", recipients=[email])
                    msg.body = f"您的密码重置验证码是：{code}，有效期10分钟。"
                    mail.send(msg)
                    flash('验证码已发送到您的邮箱，请查收！', 'success')
                    show_verification = True
                except Exception as e:
                    flash(f'发送邮件失败：{str(e)}', 'error')
            else:
                flash('该邮箱未注册！', 'error')
        else:
            # 第二步，验证验证码并重置密码
            if email in verification_codes:
                code, expiration = verification_codes[email]
                if datetime.now() > expiration:
                    flash('验证码已过期，请重新获取！', 'error')
                elif verification_code != code:
                    flash('验证码错误！', 'error')
                    show_verification = True
                elif not new_password or not confirm_password:
                    flash('新密码不能为空！', 'error')
                    show_verification = True
                elif new_password != confirm_password:
                    flash('两次输入的新密码不一致！', 'error')
                    show_verification = True
                else:
                    # 更新密码
                    conn = sqlite3.connect('users.db')
                    cursor = conn.cursor()
                    new_hashed = generate_password_hash(new_password)
                    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (new_hashed, email))
                    conn.commit()
                    conn.close()
                    
                    # 清除验证码
                    del verification_codes[email]
                    
                    flash('密码重置成功，请使用新密码登录！', 'success')
                    return redirect(url_for('login'))
            else:
                flash('验证码无效或已过期，请重新获取！', 'error')
    
    return render_template('forgot_password.html', show_verification=show_verification, email=email)

# 初始化数据库并启动应用
if __name__ == '__main__':
    init_db()
    app.run(debug=True)