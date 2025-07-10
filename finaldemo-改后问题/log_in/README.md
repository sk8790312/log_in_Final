# 登录系统

这是一个使用Flask和SQLite构建的用户登录和注册系统。

## 功能特点

- 用户注册
- 用户登录/退出
- 密码安全存储（使用哈希加密）
- 响应式美观界面
- 从原始数据文件导入用户数据

## 安装步骤

1. 克隆或下载此项目到本地

2. 安装所需依赖
```
pip install -r requirements.txt
```

3. 运行应用
```
python log_in.py
```

4. 在浏览器中访问
```
http://127.0.0.1:5000
```

## 系统结构

- `log_in.py`: 主应用程序文件
- `data.txt`: 原始用户数据文件
- `users.db`: SQLite数据库文件（运行程序后自动生成）
- `templates/`: HTML模板文件
- `static/`: 静态资源文件（CSS、JS等）

## 技术栈

- 后端：Python、Flask
- 数据库：SQLite
- 前端：HTML、CSS、Bootstrap 5
- 安全：Werkzeug密码哈希 