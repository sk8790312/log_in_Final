import os
from datetime import timedelta

class Config:
    """基础配置类"""
    
    # Flask基础配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # 数据库配置
    DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'knowledge_graph.db')
    
    # 文件上传配置
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'pdf', 'docx', 'pptx', 'txt', 'html'}
    
    # AI API配置
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY') or 'sk-420816a747e6490d8980d0807b9b5b24'
    MAX_RETRIES = 3
    BACKOFF_FACTOR = 2
    
    # 邮件配置
    MAIL_SERVER = 'smtp.qq.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USE_TLS = False
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or '1577418482@qq.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or 'jtxqxfobatvlfgac'
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or '1577418482@qq.com'
    
    # 会话配置
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = False  # 生产环境应设为True
    SESSION_COOKIE_HTTPONLY = True
    
    # 安全配置
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 3600
    
    # 日志配置
    LOG_LEVEL = 'INFO'
    LOG_FILE = 'knowledge_graph.log'
    LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    
    # 应用配置
    MAX_NODES_DEFAULT = 50
    MAX_NODES_MAX = 200
    PROCESSING_TIMEOUT = 300  # 5分钟
    
    # 缓存配置
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 300
    
    @staticmethod
    def init_app(app):
        """初始化应用配置"""
        # 确保上传目录存在
        if not os.path.exists(Config.UPLOAD_FOLDER):
            os.makedirs(Config.UPLOAD_FOLDER)
        
        # 设置日志
        import logging
        logging.basicConfig(
            level=getattr(logging, Config.LOG_LEVEL),
            format=Config.LOG_FORMAT,
            handlers=[
                logging.FileHandler(Config.LOG_FILE),
                logging.StreamHandler()
            ]
        )

class DevelopmentConfig(Config):
    """开发环境配置"""
    DEBUG = True
    TESTING = False
    
    # 开发环境特定配置
    MAIL_DEBUG = True
    LOG_LEVEL = 'DEBUG'
    
    # 允许跨域请求（开发环境）
    CORS_ORIGINS = ['http://localhost:5000', 'http://127.0.0.1:5000']

class TestingConfig(Config):
    """测试环境配置"""
    TESTING = True
    DEBUG = True
    
    # 测试环境使用内存数据库
    DATABASE = ':memory:'
    
    # 禁用CSRF保护（测试环境）
    WTF_CSRF_ENABLED = False
    
    # 测试环境邮件配置
    MAIL_SUPPRESS_SEND = True

class ProductionConfig(Config):
    """生产环境配置"""
    DEBUG = False
    TESTING = False
    
    # 生产环境安全配置
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    PERMANENT_SESSION_LIFETIME = timedelta(hours=2)
    
    # 生产环境日志级别
    LOG_LEVEL = 'WARNING'
    
    # 生产环境邮件配置
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    
    # 生产环境CORS配置
    CORS_ORIGINS = []  # 根据实际域名配置

# 配置字典
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 