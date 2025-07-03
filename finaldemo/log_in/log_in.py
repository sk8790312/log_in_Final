import os
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
from datetime import datetime
from typing import cast

# 初始化Flask应用
app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # 生成随机密钥

# finaldemo项目的URL配置
FINALDEMO_URL = "http://localhost:5001/"

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
    
    # 创建用户表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    ''')
    
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
    
    if result and check_password_hash(result[0], password):
        return True
    return False

# 注册新用户
def register_user(username, password):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    try:
        hashed_password = generate_password_hash(password)
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)",
                      (username, hashed_password))
        conn.commit()
        conn.close()
        return True
    except sqlite3.IntegrityError:
        # 用户名已存在
        conn.close()
        return False
    except Exception as e:
        print(f"注册用户时出错: {e}")
        conn.close()
        return False

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
            # 修改：登录成功后跳转到知识图谱系统
            return redirect(FINALDEMO_URL)
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
        
        if not username or not password:
            flash('用户名和密码不能为空！', 'error')
        elif password != confirm_password:
            flash('两次输入的密码不一致！', 'error')
        elif register_user(username, password):
            flash('注册成功，请登录！', 'success')
            return redirect(url_for('login'))
        else:
            flash('用户名已存在！', 'error')
    
    return render_template('register.html')

# 路由：用户仪表板
@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        flash('请先登录！', 'error')
        return redirect(url_for('login'))
    
    return render_template('dashboard.html', username=session['username'])

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

# 初始化数据库并启动应用
if __name__ == '__main__':
    init_db()
    app.run(debug=True)