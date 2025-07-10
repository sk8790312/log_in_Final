import sqlite3

# 连接到数据库
conn = sqlite3.connect('users.db')
cursor = conn.cursor()

# 显示表结构
print("===== 表结构 =====")
cursor.execute("PRAGMA table_info(users)")
columns = cursor.fetchall()
print("users表的字段有：")
for col in columns:
    print(f"ID: {col[0]}, 名称: {col[1]}, 类型: {col[2]}, 非空: {col[3]}, 默认值: {col[4]}, 主键: {col[5]}")

# 输入要查询的用户名或邮箱
username_to_check = input("请输入要查询的用户名: ")
if username_to_check:
    cursor.execute("SELECT * FROM users WHERE username=?", (username_to_check,))
    result = cursor.fetchone()
    if result:
        print(f"\n用户名 '{username_to_check}' 已存在: {result}")
    else:
        print(f"\n用户名 '{username_to_check}' 不存在。")

# 查看数据库中的所有记录
print("\n===== 数据库内容 =====")
cursor.execute("SELECT * FROM users")
all_users = cursor.fetchall()
print(f"共有 {len(all_users)} 条记录:")
for user in all_users:
    print(user)

# 关闭连接
conn.close()