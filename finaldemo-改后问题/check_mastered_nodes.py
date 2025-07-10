import sqlite3

def check_mastered_nodes():
    try:
        conn = sqlite3.connect('knowledge_graph.db')
        cursor = conn.cursor()
        
        # 检查已掌握的节点
        cursor.execute("SELECT topology_id, id, label, mastered FROM nodes WHERE mastered = 1")
        mastered_nodes = cursor.fetchall()
        
        print(f"发现 {len(mastered_nodes)} 个已掌握的节点:")
        for node in mastered_nodes:
            print(f"  拓扑ID: {node[0]}, 节点ID: {node[1]}, 标签: {node[2]}, 掌握状态: {node[3]}")
        
        # 检查所有节点的掌握状态分布
        cursor.execute("SELECT mastered, COUNT(*) FROM nodes GROUP BY mastered")
        stats = cursor.fetchall()
        
        print(f"\n节点掌握状态统计:")
        for stat in stats:
            status = "已掌握" if stat[0] == 1 else "未掌握"
            print(f"  {status}: {stat[1]} 个节点")
        
        conn.close()
        
    except Exception as e:
        print(f"错误: {str(e)}")

if __name__ == "__main__":
    check_mastered_nodes()
