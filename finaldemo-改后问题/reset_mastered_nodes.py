import sqlite3

def reset_mastered_nodes():
    try:
        conn = sqlite3.connect('knowledge_graph.db')
        cursor = conn.cursor()
        
        # 检查当前已掌握的节点数量
        cursor.execute("SELECT COUNT(*) FROM nodes WHERE mastered = 1")
        count_before = cursor.fetchone()[0]
        print(f"重置前已掌握的节点数量: {count_before}")
        
        # 将所有节点的掌握状态重置为0
        cursor.execute("UPDATE nodes SET mastered = 0, mastery_score = 0.0, consecutive_correct = 0")
        
        # 也重置quiz_sessions中的状态
        cursor.execute("UPDATE quiz_sessions SET consecutive_correct = 0, mastered = 0")
        
        conn.commit()
        
        # 检查重置后的状态
        cursor.execute("SELECT COUNT(*) FROM nodes WHERE mastered = 1")
        count_after = cursor.fetchone()[0]
        print(f"重置后已掌握的节点数量: {count_after}")
        
        print("所有节点的掌握状态已重置为未掌握状态")
        
        conn.close()
        
    except Exception as e:
        print(f"错误: {str(e)}")

if __name__ == "__main__":
    reset_mastered_nodes()
