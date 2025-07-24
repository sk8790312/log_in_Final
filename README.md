# 🧠 智能知识图谱学习平台

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)


## 📖 项目简介

智能知识图谱学习平台是一个基于Flask和AI技术的现代化学习系统，能够将用户上传的文档自动转换为交互式知识图谱，并提供智能问答、个性化学习路径、自适应测试等功能。系统集成了DeepSeek AI API，为用户提供智能化的学习体验。


## ✨ 核心功能

- **🧠 智能知识图谱生成** - 支持PDF、DOCX、PPTX、TXT、HTML等格式文档
- **💬 智能问答系统** - 基于文档内容的精准问答，支持LaTeX数学公式
- **📚 个性化学习** - 自适应测试、学习进度跟踪、智能推荐
- **🔐 用户管理** - 完整的用户认证、邮箱验证、密码重置
- **📊 可视化展示** - 基于Vis.js的交互式知识图谱


## 🚀 快速开始

### 环境要求
- Python 3.8+
- 现代浏览器

### 安装步骤

1. **克隆项目**
```bash
git clone <项目地址>
cd Merge_final
```

2. **创建虚拟环境**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. **安装依赖**
```bash
pip install -r requirements.txt
```

4. **配置API密钥**
```bash
export OPENAI_API_KEY="your-deepseek-api-key"
```

5. **初始化数据库**
```bash
python -c "from app import init_db; init_db()"
```

6. **启动应用**
```bash
python app.py
```

7. **访问应用**
打开浏览器访问：`http://localhost:5000`


## 🎯 使用指南

### 用户注册与登录
1. 访问首页，点击"注册"按钮
2. 填写用户名、邮箱和密码
3. 验证邮箱地址
4. 使用注册的账号登录系统

### 文档上传与处理
1. 登录后进入主界面
2. 点击"上传文档"区域或拖拽文件
3. 选择支持的文档格式（PDF、DOCX、PPTX、TXT、HTML）
4. 系统自动处理文档并生成知识图谱

### 知识图谱交互
- **图谱浏览**：点击节点查看详细信息
- **搜索功能**：在图谱中搜索特定概念
- **缩放操作**：使用鼠标滚轮缩放图谱
- **拖拽移动**：拖拽图谱进行平移操作

### 智能问答
1. 在问答界面输入问题
2. 系统优先从上传文档中查找答案
3. 如果文档内容不足，自动调用网络资源
4. 获得包含数学公式和格式化文本的回答

### 学习测试
1. 点击图谱中的节点
2. 系统生成相关测试题
3. 回答问题获得即时反馈
4. 标记知识点掌握状态


## 🏗️ 技术架构

### 后端技术栈
- **Flask 2.3.3** - Web框架
- **SQLite** - 数据库
- **DeepSeek API** - AI智能服务
- **Flask-Mail** - 邮件服务
- **PyPDF2/python-docx/python-pptx** - 文档解析

### 前端技术栈
- **HTML5/CSS3** - 响应式界面
- **JavaScript ES6+** - 交互逻辑
- **Vis.js** - 知识图谱可视化
- **MathJax** - 数学公式渲染
- **Bootstrap 5** - UI组件库


## 🔧 配置说明

### 邮件配置
在 `app.py` 中修改邮件配置：
```python
app.config['MAIL_SERVER'] = 'smtp.qq.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'your-email@qq.com'
app.config['MAIL_PASSWORD'] = 'your-email-password'
```

### API配置
在 `app.py` 中设置DeepSeek API密钥：
```python
OPENAI_API_KEY = "your-deepseek-api-key"
```


## 🐛 常见问题

### 1. API密钥错误
- 检查DeepSeek API密钥配置
- 确认API密钥有效且有足够额度

### 2. 邮件发送失败
- 检查邮箱配置
- 确认SMTP设置正确

### 3. 文档上传失败
- 检查文件格式是否支持
- 确认文件大小在限制范围内

### 4. 图谱生成失败
- 检查文档内容是否可读
- 确认AI API服务正常


## 📊 数据库结构

### 核心表
- **topologies** - 知识图谱表
- **nodes** - 知识节点表
- **edges** - 知识关系表
- **users** - 用户表
- **questions** - 问答会话表


## 🔒 安全特性

- **密码哈希** - 使用Werkzeug进行密码哈希存储
- **会话管理** - 安全的用户会话控制
- **SQL注入防护** - 参数化查询
- **XSS攻击防护** - 输入验证和输出转义
- **文件安全** - 文件类型验证和大小限制


## 📞 联系方式

- **项目维护者**：[Young]
- **邮箱**：[xinye0370@gmail.com]
- **GitHub**：[sk8790312]


## 🙏 致谢

感谢以下开源项目：
- [Flask](https://flask.palletsprojects.com/) - Web框架
- [DeepSeek](https://www.deepseek.com/) - AI智能服务
- [Vis.js](https://visjs.org/) - 知识图谱可视化
- [MathJax](https://www.mathjax.org/) - 数学公式渲染
- [Bootstrap](https://getbootstrap.com/) - UI组件库

---

**版本信息**：v1.0.0  
**最后更新**：2025年7月  
**维护状态**：活跃维护 
