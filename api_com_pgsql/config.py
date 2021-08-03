import os
import configparser
# from dotenv import load_dotenv, find_dotenv
# load_dotenv()
# load_dotenv(find_dotenv())
# load_dotenv('.env')
# dotenv.read_dotenv(os.path.join(
#     os.path.dirname(os.path.dirname(__file__)), '.env'))

basedir = os.path.abspath(os.path.dirname(__file__))


def _get_bool_env_var(varname, default=None):

    value = os.environ.get(varname, default)

    if value is None:
        return False
    elif isinstance(value, str) and value.lower() == 'false':
        return False
    elif bool(value) is False:
        return False
    else:
        return bool(value)


class BaseConfig(object):
    """Base configuration."""

    # main config
    SECRET_KEY = 'my_precious'
    SECURITY_PASSWORD_SALT = 'my_precious_two'
    DEBUG = True
    BCRYPT_LOG_ROUNDS = 13
    WTF_CSRF_ENABLED = True
    DEBUG_TB_ENABLED = False
    DEBUG_TB_INTERCEPT_REDIRECTS = False
    # SQLALCHEMY_ECHO = True

    # mail settings
    MAIL_SERVER = 'smtp.sendgrid.net'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False

    # gmail authentication
    MAIL_USERNAME = os.environ['APP_MAIL_USERNAME']
    MAIL_PASSWORD = os.environ['APP_MAIL_PASSWORD']

    # mail accounts
    MAIL_DEFAULT_SENDER = 'envios@metabravo.com'

    # grecaptcha key:
    GRECAPTCHA_KEY = os.environ['GRECAPTCHA_KEY']

    # JWT

    # JWT_TOKEN_LOCATION = ['headers', 'cookies']
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    # JWT_BLACKLIST_ENABLED = True
    # JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    # JWT_REFRESH_COOKIE_PATH = '/token/refresh'
    # JWT_CSRF_IN_COOKIES = False
    # JWT_COOKIE_CSRF_PROTECT = True
    # JWT_CSRF_CHECK_FORM = True
    UPLOAD_FOLDER = os.path.join(basedir, 'static')
    ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'])
    ALLOWED_MIMETYPES_EXTENSIONS = set(
        ['image/apng', 'image/bmp', 'image/jpeg', 'image/png', 'image/svg+xml'])


class DevelopmentConfig(BaseConfig):
    """Development configuration."""
    DEBUG = True
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + \
        os.path.join(basedir, 'mimir.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG_TB_ENABLED = True
    # setting up our JWT secret key:
    JWT_SECRET_KEY = 'jwt-secret-string'
    API_URL = 'http://localhost:1234/api'


class TestingConfig(BaseConfig):
    """Testing configuration."""
    LOGIN_DISABLED = False
    TESTING = True
    DEBUG = False
    BCRYPT_LOG_ROUNDS = 1
    WTF_CSRF_ENABLED = False
    DEBUG_TB_ENABLED = False
    SQLALCHEMY_DATABASE_URI = 'sqlite://'


class ProductionConfig(BaseConfig):
    """Production configuration."""
    DEBUG = False
    DEBUG_TB_ENABLED = False

    SECRET_KEY = os.environ['SECRET_KEY']
    SECURITY_PASSWORD_SALT = os.environ['SECURITY_PASSWORD_SALT']

    # APPLICATION_ROOT = os.getenv("APPLICATION_ROOT") or os.getcwd()

    STRIPE_SECRET_KEY = None
    STRIPE_PUBLISHABLE_KEY = None

    # SQLALCHEMY_DATABASE_URI = 'sqlite:////app/mimir.db'
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite://")
    print(SQLALCHEMY_DATABASE_URI)
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.environ['JWT_SECRET_KEY']

    API_URL = 'https://mimir.metabravo.com/api'
