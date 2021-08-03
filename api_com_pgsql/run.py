# import the os module:
import os
# here we are importing Flask
from flask import Flask, json
# importing the Api from the  Flask restfull library
from flask_restful import Api
# Now we importing SQLAlchemy from the SQLAlchemy library
from flask_sqlalchemy import SQLAlchemy
# importing datetime to use use with our dates and times
from datetime import datetime
# importing JWT:
from flask_jwt_extended import JWTManager
# importing requests:
import requests
# flask cors to accept other domain requests
from flask_cors import CORS
# import flask_main to send emails
from flask_mail import Mail

from dotenv import find_dotenv, load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

# let's instantialize our app and api:
app = Flask(__name__)
api = Api(app)


app.config.from_object(os.environ['APP_SETTINGS'])
app.config['PROPAGATE_EXCEPTIONS'] = True
app.debug = False
print(os.environ['APP_SETTINGS'])


# let's instantialize mail from flask_mail
mail = Mail(app)

# cors = CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500/"}})
if os.environ['APP_SETTINGS'] == "config.DevelopmentConfig":
    cors = CORS(app, origins=['http://127.0.0.1:5500',
                              'http://localhost:5500', 'http://localhost:1234'])


# once we instantiated our SQLAlchemy at the top of the file we can start creating the class, so we pass `app` to SQLAlchemy:
db = SQLAlchemy(app)

# Ensure FOREIGN KEY for sqlite3:
# Enforce FK constraint for SQLite with when using flask-sqlalchemy,
# so ondelete="cascade" (on the association table note_tags at models.py) works

if 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI']:
    def _fk_pragma_on_connect(dbapi_con, con_record):  # noqa
        dbapi_con.execute('pragma foreign_keys=ON')

    with app.app_context():
        from sqlalchemy import event
        event.listen(db.engine, 'connect', _fk_pragma_on_connect)


def is_human(captcha_response):
    """ Validating recaptcha response from google server
        Returns True captcha test passed for submitted form else returns False.
    """
    secret = app.config['GRECAPTCHA_KEY']
    payload = {'response': captcha_response, 'secret': secret}
    response = requests.post(
        "https://www.google.com/recaptcha/api/siteverify", payload)
    response_text = json.loads(response.text)
    return response_text['success']


# instantializing JWTManager:
jwt = JWTManager(app)


@jwt.token_in_blocklist_loader
def check_if_token_in_blocklist(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return models.RevokedTokenModel.is_jti_blocklisted(jti)


import views
import models
import resources

api.add_resource(resources.UserRegistration, '/registration')
api.add_resource(resources.UserLogin, '/login')
api.add_resource(resources.UserLogoutAccess, '/logout/access')
api.add_resource(resources.UserLogoutRefresh, '/logout/refresh')
api.add_resource(resources.TokenRefresh, '/token/refresh')
# api.add_resource(resources.AllUsers, '/users')
# api.add_resource(resources.SecretResource, '/secret')
api.add_resource(resources.ConfirmAccount,
                 '/confirm/<emailtoken>', endpoint="confirm")
api.add_resource(resources.ResendEmail, '/resend')
# api.add_resource(resources.LoggedIn, '/isloggedin')
api.add_resource(resources.CategoryInfo, '/category')
api.add_resource(resources.Categories, '/categories')
api.add_resource(resources.Tags, '/tags')
api.add_resource(resources.Notes, '/note')
api.add_resource(resources.NotesCat, '/notes')
api.add_resource(resources.NotesFav, '/notes/fav')
api.add_resource(resources.LatestNotes, '/notes/latest')
api.add_resource(resources.UserProfile, '/user/profile')
api.add_resource(resources.ChangePwd, '/user/changepwd')
api.add_resource(resources.SearchNotes, '/notes/search')
api.add_resource(resources.NoteDisplayPictureResource,
                 '/image', endpoint="display_image")
