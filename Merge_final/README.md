# 智能知识图谱学习平台

## 📖 项目简介

智能知识图谱学习平台是一个基于Flask和AI技术的现代化学习系统，能够将用户上传的文档自动转换为交互式知识图谱，并提供智能问答、个性化学习路径、自适应测试等功能。系统集成了DeepSeek AI API，为用户提供智能化的学习体验。

## ✨ 核心功能

### 🧠 智能知识图谱生成
- **多格式文档支持**：PDF、DOCX、PPTX、TXT、HTML等格式
- **自动知识提取**：使用AI技术从文档中提取关键概念和关系
- **层次化图谱结构**：自动构建多层级的知识节点和连接关系
- **可视化展示**：基于Vis.js的交互式图谱可视化

### 💬 智能问答系统
- **文档内容问答**：基于上传文档内容的精准问答
- **网络智能问答**：当文档内容不足时，自动调用网络资源
- **LaTeX数学公式支持**：完美支持数学公式的显示和渲染
- **Markdown格式输出**：结构化、美观的回答格式

### 📚 个性化学习功能
- **自适应测试**：根据知识图谱节点生成个性化测试题
- **学习进度跟踪**：记录每个知识点的掌握状态
- **智能推荐**：基于学习内容推荐相关学习资源
- **学习路径优化**：根据掌握程度推荐最佳学习路径

### 🔐 用户管理系统
- **用户注册登录**：完整的用户认证系统
- **邮箱验证**：安全的邮箱验证机制
- **密码重置**：忘记密码时的安全重置流程
- **个人资料管理**：用户信息维护和密码修改

## 🏗️ 技术架构

### 后端技术栈
- **Flask 2.3.3**：轻量级Web框架
- **SQLite**：嵌入式数据库
- **DeepSeek API**：AI智能服务
- **Flask-Mail**：邮件服务
- **Werkzeug**：密码哈希和安全
- **PyPDF2/python-docx/python-pptx**：文档解析

### 前端技术栈
- **HTML5/CSS3**：现代化响应式界面
- **JavaScript ES6+**：交互逻辑和数据处理
- **Vis.js**：知识图谱可视化
- **MathJax**：数学公式渲染
- **Marked.js**：Markdown解析
- **Bootstrap**：UI组件库

### 核心模块
```
├── 文档处理模块
│   ├── 多格式文档解析
│   ├── 文本内容提取
│   └── 异步处理队列
├── AI智能模块
│   ├── 知识图谱生成
│   ├── 智能问答系统
│   └── 学习资源推荐
├── 数据管理模块
│   ├── 用户数据管理
│   ├── 知识图谱存储
│   └── 学习进度跟踪
└── 前端展示模块
    ├── 图谱可视化
    ├── 交互式界面
    └── 响应式设计
```

## 📦 安装部署

### 环境要求
- Python 3.8+
- pip 包管理器
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆项目**
```bash
git clone <项目地址>
cd finaldemo
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

4. **配置环境变量**
```bash
# 设置DeepSeek API密钥
export OPENAI_API_KEY="your-api-key-here"
# Windows
set OPENAI_API_KEY=your-api-key-here
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

### 配置说明

#### 邮件配置
在 `app.py` 中修改邮件配置：
```python
app.config['MAIL_SERVER'] = 'smtp.qq.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'your-email@qq.com'
app.config['MAIL_PASSWORD'] = 'your-email-password'
```

#### API配置
在 `app.py` 中设置DeepSeek API密钥：
```python
OPENAI_API_KEY = "your-deepseek-api-key"
```

## 🚀 使用指南

### 用户注册与登录
1. 访问首页，点击"注册"按钮
2. 填写用户名、邮箱和密码
3. 验证邮箱地址
4. 使用注册的账号登录系统

### 文档上传与处理
1. 登录后进入主界面
2. 点击"上传文档"区域
3. 选择支持的文档格式（PDF、DOCX、PPTX、TXT、HTML）
4. 系统自动处理文档并生成知识图谱

### 知识图谱交互
1. **图谱浏览**：点击节点查看详细信息
2. **层级导航**：通过图谱层级结构探索知识
3. **搜索功能**：在图谱中搜索特定概念
4. **缩放操作**：使用鼠标滚轮或工具栏缩放图谱

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

## 📊 数据库结构

### 核心表结构
```sql
-- 知识图谱表
topologies (id, created_at)

-- 知识节点表
nodes (id, topology_id, label, level, value, mastered)

-- 知识关系表
edges (topology_id, from_node, to_node, label)

-- 用户表
users (id, username, email, password_hash, email_verified, created_at)

-- 问答会话表
questions (id, topology_id, node_id, question, answer, feedback, created_at, answered_at)

-- 密码重置表
password_resets (id, user_id, token, expires_at)
```

## 🔧 API接口文档

### 知识图谱相关
- `POST /api/generate` - 生成知识图谱
- `GET /api/topology/<topology_id>` - 获取图谱数据
- `POST /api/topology/<topology_id>/regenerate` - 重新生成图谱
- `GET /api/topology/<topology_id>/node/<node_id>/question` - 获取测试题

### 用户管理相关
- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录
- `POST /api/logout` - 用户登出
- `GET /api/user` - 获取用户信息
- `PUT /api/user` - 更新用户信息

### 智能问答相关
- `POST /api/chat` - 智能问答
- `POST /api/topology/<topology_id>/question/<question_id>/answer` - 回答问题

## 🎨 界面功能

### 主要页面
- **首页** (`/`)：系统介绍和功能导航
- **登录页** (`/login`)：用户登录界面
- **注册页** (`/register`)：用户注册界面
- **仪表板** (`/dashboard`)：用户个人中心
- **知识图谱页** (`/`)：主要功能界面

### 核心组件
- **文档上传区**：拖拽上传和文件选择
- **知识图谱可视化**：交互式图谱展示
- **智能问答区**：AI问答界面
- **学习进度跟踪**：知识点掌握状态
- **用户信息面板**：个人信息和设置

## 🔒 安全特性

### 用户认证
- 密码哈希存储（Werkzeug）
- 会话管理
- 登录状态验证

### 数据安全
- SQL注入防护
- XSS攻击防护
- CSRF保护

### 文件安全
- 文件类型验证
- 文件大小限制
- 安全文件存储

## 📈 性能优化

### 后端优化
- 异步文档处理
- 数据库连接池
- API响应缓存
- 错误重试机制

### 前端优化
- 图谱渲染优化
- 懒加载机制
- 响应式设计
- 浏览器兼容性

## 🐛 故障排除

### 常见问题

1. **API密钥错误**
   - 检查DeepSeek API密钥配置
   - 确认API密钥有效且有足够额度

2. **邮件发送失败**
   - 检查邮箱配置
   - 确认SMTP设置正确
   - 验证邮箱密码

3. **文档上传失败**
   - 检查文件格式是否支持
   - 确认文件大小在限制范围内
   - 查看服务器日志

4. **图谱生成失败**
   - 检查文档内容是否可读
   - 确认AI API服务正常
   - 查看处理日志

### 日志查看
```bash
# 查看应用日志
tail -f knowledge_graph.log

# 查看Flask调试信息
python app.py --debug
```

## 🤝 贡献指南

### 开发环境设置
1. Fork项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request

### 代码规范
- 遵循PEP 8 Python代码规范
- 添加适当的注释和文档
- 编写单元测试
- 确保代码通过lint检查

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 📞 联系方式

- 项目维护者：[维护者姓名]
- 邮箱：[联系邮箱]
- 项目地址：[GitHub地址]

## 🙏 致谢

感谢以下开源项目和技术：
- Flask Web框架
- DeepSeek AI API
- Vis.js可视化库
- MathJax数学公式渲染
- Bootstrap UI框架

---

**版本信息**：v1.0.0  
**最后更新**：2025年7月  
**维护状态**：活跃维护 