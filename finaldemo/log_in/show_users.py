import sqlite3

# 连接到数据库
conn = sqlite3.connect('users.db')
cursor = conn.cursor()

# 查询所有用户
cursor.execute("SELECT id, username, password FROM users")
users = cursor.fetchall()

# 打印结果
print("ID | 用户名 | 密码哈希")
print("-" * 50)
for user in users:
    print(f"{user[0]} | {user[1]} | {user[2]}")

conn.close()