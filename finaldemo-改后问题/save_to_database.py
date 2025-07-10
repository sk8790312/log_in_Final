import sqlite3
import time
import uuid
import json
import os

def save_to_database(topology_id, nodes, edges, content, max_nodes=0):
    """将知识图谱保存到数据库"""
    try:
        db_path = 'knowledge_graph.db'
        
        # 连接数据库
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 保存拓扑图基本信息
        cursor.execute(
            "INSERT OR REPLACE INTO topologies (id, content, max_nodes, created_at) VALUES (?, ?, ?, ?)",
            (topology_id, content, max_nodes, time.strftime('%Y-%m-%d %H:%M:%S'))
        )
        
        # 删除旧的节点和边
        cursor.execute("DELETE FROM nodes WHERE topology_id = ?", (topology_id,))
        cursor.execute("DELETE FROM edges WHERE topology_id = ?", (topology_id,))
        
        # 保存节点
        for node in nodes:
            cursor.execute(
                """INSERT INTO nodes 
                (id, topology_id, label, level, value, mastered, mastery_score, consecutive_correct, content_snippet) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    node["id"], 
                    topology_id, 
                    node["label"], 
                    node["level"], 
                    node["value"], 
                    1 if node.get("highlighted", False) else 0,  # 使用highlighted字段作为mastered的值
                    node.get("mastery_score", 0.0), 
                    node.get("consecutive_correct", 0), 
                    node.get("content_snippet", "")
                )
            )
        
        # 保存边
        for edge in edges:
            cursor.execute(
                "INSERT INTO edges (topology_id, from_node, to_node, label) VALUES (?, ?, ?, ?)",
                (topology_id, edge["from"], edge["to"], edge["label"])
            )
        
        # 提交事务
        conn.commit()
        
        # 关闭连接
        conn.close()
        
        print(f"知识图谱已保存到数据库，拓扑ID: {topology_id}")
        return True
    except Exception as e:
        print(f"保存知识图谱到数据库时出错: {str(e)}")
        return False

def save_history(title, content, description=""):
    """保存知识图谱到历史记录"""
    try:
        db_path = 'knowledge_graph.db'
        
        # 连接数据库
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # 生成唯一ID
        history_id = str(uuid.uuid4())
        created_at = time.strftime('%Y-%m-%d %H:%M:%S')
        
        # 将知识图谱数据转换为JSON字符串
        content_json = json.dumps(content, ensure_ascii=False)
        
        # 保存到历史记录表
        cursor.execute(
            "INSERT INTO history_records (id, title, content, description, created_at) VALUES (?, ?, ?, ?, ?)",
            (history_id, title, content_json, description, created_at)
        )
        
        # 提交事务
        conn.commit()
        
        # 关闭连接
        conn.close()
        
        print(f"知识图谱已保存到历史记录，ID: {history_id}")
        return history_id
    except Exception as e:
        print(f"保存知识图谱到历史记录时出错: {str(e)}")
        return None

def get_history_list():
    """获取历史记录列表"""
    try:
        db_path = 'knowledge_graph.db'
        
        # 检查数据库是否存在
        if not os.path.exists(db_path):
            print(f"数据库文件 {db_path} 不存在")
            return []
        
        # 连接数据库
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # 使用字典游标
        cursor = conn.cursor()
        
        # 获取历史记录列表（不包含content字段，减少数据量）
        cursor.execute(
            "SELECT id, title, description, created_at FROM history_records ORDER BY created_at DESC"
        )
        history_list = [dict(row) for row in cursor.fetchall()]
        
        # 关闭连接
        conn.close()
        
        return history_list
    except Exception as e:
        print(f"获取历史记录列表时出错: {str(e)}")
        return []

def get_history_by_id(history_id):
    """根据ID获取历史记录"""
    try:
        db_path = 'knowledge_graph.db'
        
        # 连接数据库
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # 使用字典游标
        cursor = conn.cursor()
        
        # 获取历史记录
        cursor.execute(
            "SELECT id, title, content, description, created_at FROM history_records WHERE id = ?",
            (history_id,)
        )
        history = cursor.fetchone()
        
        # 关闭连接
        conn.close()
        
        if not history:
            return None
        
        # 将JSON字符串转换为Python对象
        history_dict = dict(history)
        history_dict["content"] = json.loads(history_dict["content"])
        
        return history_dict
    except Exception as e:
        print(f"获取历史记录时出错: {str(e)}")
        return None 