import sqlite3
import os

def add_history_table():
    try:
        db_path = 'knowledge_graph.db'
        
        # 检查数据库是否存在
        if not os.path.exists(db_path):
            print(f"数据库文件 {db_path} 不存在")
            return
        
        # 连接数据库
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 检查历史记录表是否已存在
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='history_records'")
        if cursor.fetchone():
            print("历史记录表已存在")
            
            # 检查是否需要添加新字段
            cursor.execute("PRAGMA table_info(history_records)")
            columns = [column[1] for column in cursor.fetchall()]
            
            # 添加缺失的字段
            if 'user_id' not in columns:
                cursor.execute("ALTER TABLE history_records ADD COLUMN user_id TEXT")
                print("添加了user_id字段")
            
            if 'file_path' not in columns:
                cursor.execute("ALTER TABLE history_records ADD COLUMN file_path TEXT")
                print("添加了file_path字段")
            
            conn.commit()
        else:
            # 创建历史记录表
            cursor.execute('''
            CREATE TABLE history_records (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                description TEXT,
                created_at TEXT NOT NULL,
                user_id TEXT,
                file_path TEXT
            )
            ''')
            conn.commit()
            print("历史记录表创建成功")
        
        # 关闭连接
        conn.close()
        print("操作完成")
    except Exception as e:
        print(f"错误: {str(e)}")

if __name__ == "__main__":
    add_history_table() 