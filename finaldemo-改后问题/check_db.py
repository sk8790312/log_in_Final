import sqlite3

def check_db():
    try:
        conn = sqlite3.connect('knowledge_graph.db')
        cursor = conn.cursor()
        
        # 获取所有表名
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        print("数据库表结构:")
        for table in tables:
            table_name = table[0]
            print(f"\n表名: {table_name}")
            
            # 获取表结构
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = cursor.fetchall()
            
            print("列信息:")
            for col in columns:
                print(f"  {col[1]} ({col[2]})")
                
        conn.close()
        print("\n数据库检查完成")
    except Exception as e:
        print(f"错误: {str(e)}")

if __name__ == "__main__":
    check_db() 