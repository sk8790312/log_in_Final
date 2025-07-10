# 智能知识图谱系统


## 一.项目概述
智能知识图谱系统是一个AI驱动的知识管理与学习辅助平台，由登录系统和知识图谱生成系统两部分组成。系统能够自动分析上传的文档内容，提取关键知识点，并生成可视化的知识图谱，帮助用户进行高效学习与知识梳理。
![系统截图](https://via.placeholder.com/800x400?text=智能知识图谱系统)


## 二.核心功能

### 1）用户系统
- 用户注册与登录
- 个人中心管理
- 密码修改

### 2）知识图谱生成
- 支持多格式文档上传（PDF、Word、TXT等）
- AI自动提取文档中的关键知识点
- 生成知识点之间的关联关系
- 可视化知识图谱展示

### 3）智能学习辅助
- 知识点掌握度标记
- 基于知识点生成智能问题
- 回答评估与反馈
- 学习进度追踪


## 三.技术栈
- 后端：Flask、SQLite、Python
- 前端：HTML、CSS、JavaScript
- AI处理：DeepSeek API
- 文档处理：PyPDF2、python-docx、BeautifulSoup等


## 四.安装与启动

### 1）前置条件
- Python 3.8+
- pip包管理工具

### 2）安装依赖
```bash
# 安装登录系统依赖
cd log_in
pip install -r requirements.txt

# 安装知识图谱系统依赖
cd ..
pip install flask flask_cors PyPDF2 python-docx bs4 pptx requests
```

### 3）启动服务
请注意！共需要启动两个服务：

 1. 登录系统（端口5000）
```bash
cd log_in
python log_in.py
```

 2. 知识图谱系统（端口5001）
```bash
python app.py
```


## 五.使用指南

### 1）用户登录
- 访问 http://localhost:5000
- 注册新账号或使用现有账号登录
- 登录成功后，系统自动跳转到知识图谱系统

### 2）知识图谱系统
- 上传学习资料：支持PDF、Word、PPT、TXT等格式
- 设置节点数量：可选择限制生成的知识点数量
- 生成图谱：系统自动分析文档并生成知识图谱

### 3）图谱交互
- 节点浏览：查看各个知识点的详情
- 标记掌握状态：记录学习进度
- 知识问答：点击节点启动针对该知识点的问答测试
- 答题评估：系统自动评估回答并提供反馈

### 4）个人中心
- 点击右上角"个人中心"按钮访问
- 查看个人信息
- 修改密码
- 快速返回知识图谱系统


## 六.系统截图

### 1）登录界面
![登录界面](https://via.placeholder.com/400x200?text=登录界面)

### 2）知识图谱生成
![知识图谱生成](https://via.placeholder.com/400x200?text=知识图谱生成)

### 3）问答系统
![问答系统](https://via.placeholder.com/400x200?text=问答系统)


## 七.部署说明

### 1）开发环境
系统默认配置为开发环境，两个服务分别运行在：
- 登录系统：http://localhost:5000
- 知识图谱系统：http://localhost:5001

### 2）生产环境部署
对于生产环境部署，建议：
1. 使用Nginx等Web服务器作为反向代理
2. 使用Gunicorn或uWSGI作为WSGI服务器
3. 配置HTTPS加密连接
4. 更换为更稳定的数据库（如MySQL/PostgreSQL）


## 八.注意事项
- DeepSeek API需要替换为实际有效的API密钥
- 默认上传文件存储在`uploads`目录
- 数据库文件存储在项目根目录


## 九.许可证
[MIT License](LICENSE)


© 2025 智能助教系统 | 知识图谱学习平台  