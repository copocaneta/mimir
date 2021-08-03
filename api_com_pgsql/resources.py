from flask_restful import Resource, reqparse, fields, marshal_with
from models import User, UserSchema, RevokedTokenModel, Category, CategorySchema, CategoriesSchema, CategoryNoteSchema, Note, NoteSchema, NoteCatSchema, NoteShowSchema, Tag, TagSchema, ValidationError, NoteTagSchema, UserProfileSchema, ChangePwdSchema, SearchSchema
from emailtoken import generate_confirmation_token, confirm_token
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, get_jwt_identity, get_jwt, set_refresh_cookies, unset_jwt_cookies, get_csrf_token)
from run import is_human, datetime, db, app
from emailaction import send_email
from flask import render_template, url_for, jsonify, request, make_response, Response, send_from_directory, redirect
from sqlalchemy import desc, and_
# for slugigy
import unicodedata
import os
import re
import json
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
import zlib
from PIL import Image
import PIL
import glob
import sys
# parser = reqparse.RequestParser()

categories_schema = CategoriesSchema(many=True)
categorynote_schema = CategoryNoteSchema()
category_schema = CategorySchema()
user_schema = UserSchema()
tags_schema = TagSchema(many=True)
tag_schema = TagSchema()
note_schema = NoteSchema()
noteshow_schema = NoteShowSchema()
notecat_schema = NoteCatSchema(many=True)
notetag_schema = NoteTagSchema(many=True)
userprofile_schema = UserProfileSchema()
changepwd_schema = ChangePwdSchema()
search_schema = SearchSchema(many=True)


def slugify(value, allow_unicode=False):
    """
    Convert to ASCII if 'allow_unicode' is False. Convert spaces to hyphens.
    Remove characters that aren't alphanumerics, underscores, or hyphens.
    Convert to lowercase. Also strip leading and trailing whitespace.
    """
    value = str(value)
    if allow_unicode:
        value = unicodedata.normalize('NFKC', value)
    else:
        value = unicodedata.normalize('NFKD', value).encode(
            'ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower()).strip()
    return re.sub(r'[-\s]+', '-', value)


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in app.config["ALLOWED_EXTENSIONS"]
    )

# determnistic hash funcion to use for scrambling
#  user's upload directory string


def hashString(string):
    return zlib.adler32(string.encode('utf-8'))


class UserRegistration(Resource):
    def post(self):
        # parser.add_argument(
        #     'email', help='This field cannot be blank', required=True)
        # parser.add_argument(
        #     'password', help='This field cannot be blank', required=True)
        # parser.add_argument(
        #     'g-recaptcha-response', help='You cant register without validating the captcha', required=True)
        # data = parser.parse_args()
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        # data, errors = user_schema.load(json_data)
        try:
            data = user_schema.load(json_data)
        except ValidationError as err:
            return err.messages, 422

        print(json_data)
        captcha_response = json_data['grecaptcharesponse']
        if is_human(captcha_response):

            if User.find_by_email(json_data['email']):
                return {'message': 'E-mail {} already exists'. format(json_data['email'])}
            new_user = User(
                email=json_data['email'],
                name=json_data['name'],
                password=User.generate_hash(json_data['password']),
                upload_directory=hashString(json_data['email'])
            )
            try:

                new_user.save_to_db()
                access_token = create_access_token(identity=data['email'])
                refresh_token = create_refresh_token(identity=data['email'])
                emailtoken = generate_confirmation_token(data['email'])
                print('passou por aqui')
                # confirm_url = url_for(
                #     'confirm', emailtoken=emailtoken, _external=True)
                confirm_url = url_for(
                    'confirm', emailtoken=emailtoken)
                html = render_template(
                    'user/activate.html', confirm_url=confirm_url, api_url=app.config["API_URL"])
                subject = "Please confirm your email"
                send_email(data['email'], subject, html)
                return {
                    'status': 'success', 'message': 'User {} was created. A confirmation email has been sent via email.'.format(data['email']),
                    # 'access_token': access_token,
                    # 'refresh_token': refresh_token
                }
            except Exception as e:
                print("type error: " + str(e))
                return {'message': 'Something went wrong (' + str(e) + ')'}, 500
        else:
            return {'message': 'This captcha was not validated'}


class ConfirmAccount(Resource):
    def get(self, emailtoken):
        print(emailtoken)
        try:
            email = confirm_token(emailtoken)
        except:
            return {'message': 'The confirmation link is invalid or has expired.'}, 500
        user = User.query.filter_by(email=email).first_or_404()
        if user.confirmed:
            return {'message': 'Account already confirmed. Please login.'}
        else:
            user.confirmed = True
            user.confirmed_on = datetime.utcnow()
            db.session.add(user)
            db.session.commit()
            # return {'message': 'You have confirmed your account. Thanks!'}
            return redirect("https://mimir.metabravo.com", code=302)


class UserLogin(Resource):
    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = user_schema.load(json_data)
        except ValidationError as err:
            return err.messages, 422
        print(data)
        print(json_data)
        captcha_response = json_data['grecaptcharesponse']
        current_user = User.find_by_email(json_data['email'])
        if is_human(captcha_response):
            if not current_user:
                return {'message': 'Wrong credentials'}

            if User.verify_hash(json_data['password'], current_user.password):
                print(current_user.confirmed)
                if current_user.confirmed == True:
                    access_token = create_access_token(
                        identity=json_data['email'])
                    refresh_token = create_refresh_token(
                        identity=json_data['email'])
                    resp = jsonify(
                        {'message': 'Success', 'access_token': access_token})
                    set_refresh_cookies(resp, refresh_token)
                    return resp
                else:
                    return {'message': 'Please check your email and confirm your signup'}
            else:
                return {'message': 'Wrong credentials'}
        else:
            return {'message': 'Invalid captcha'}


class UserLogoutAccess(Resource):
    @jwt_required()
    def post(self):
        jti = get_jwt()['jti']
        try:
            revoked_token = RevokedTokenModel(jti=jti)
            revoked_token.add()
            return {'message': 'Access token has been revoked'}
        except Exception as e:
            print("type error: " + str(e))
            return {'message': 'Something went wrong'}, 500


class UserLogoutRefresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        jti = get_jwt()['jti']
        try:
            revoked_token = RevokedTokenModel(jti=jti)
            revoked_token.add()
            return {'message': 'Refresh token has been revoked'}
        except:
            return {'message': 'Something went wrong'}, 500


class TokenRefresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        try:
            current_user = get_jwt_identity()
            access_token = create_access_token(identity=current_user)
            return {'msg': access_token}
        except:
            return {'msg': 'Something went wrong'}, 500


class ResendEmail(Resource):
    def post(self):
        parser.add_argument(
            'email', help='This field cannot be blank', required=True)
        data = parser.parse_args()
        try:
            emailtoken = generate_confirmation_token(data['email'])
            confirm_url = url_for(
                'confirm', emailtoken=emailtoken)
            html = render_template(
                'user/activate.html', confirm_url=confirm_url, api_url=app.config["API_URL"])
            subject = "Please confirm your email"
            send_email(data['email'], subject, html)
            return {'message': 'A new confirmation email has been sent.'}, 200
        except Exception as e:
            print("type error: " + str(e))
            return {'message': 'Could not ressend confirmation email'}, 500


class AllUsers(Resource):
    @jwt_required()
    def get(self):
        return User.return_all()

    @jwt_required()
    def delete(self):
        return User.delete_all()


class SecretResource(Resource):
    @jwt_required()
    def get(self):
        return {
            'answer': 42
        }

# the resource for category:
#  - creating single category,
#  - requesting single category info,
#  - updating single category
#  - deleting single category


class CategoryInfo(Resource):
    @jwt_required()
    def get(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = category_schema.load(json_data, partial=('name',))
        except ValidationError as err:
            return err.messages, 422
        # get current user
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        # querying the category by id and user_id
        category = Category.query.filter_by(
            id=data['id'], user_id=current_user).first()
        category = category_schema.dump(category)
        return {'status': 'success', 'data': category}, 200

    @jwt_required()
    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = category_schema.load(json_data)
        except ValidationError as err:
            return err.messages, 422
        category = Category.query.filter_by(name=data['name']).first()
        if category:
            return {'message': 'Category already exists'}, 400
        slug = slugify(json_data['name'])
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        print(f'current_user eh {current_user}')
        category = Category(
            name=json_data['name'], slug=slug, user_id=current_user)
        db.session.add(category)
        db.session.commit()
        result = category_schema.dump(category)
        return {'status': 'success', 'data': result}, 201

    @jwt_required()
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = category_schema.load(json_data)
        except ValidationError as err:
            return err.messages, 422
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        category = Category.query.filter_by(
            id=data['id'], user_id=current_user).first()
        if not category:
            return {'message': 'Category does not exist'}, 400
        slug = slugify(json_data['name'])
        category.slug = slug
        category.name = data['name']
        db.session.commit()
        result = category_schema.dump(category)
        return {'status': 'success', 'data': result}, 201

    # patch category
    @jwt_required()
    def patch(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = category_schema.load(json_data, partial=('name',))
        except ValidationError as err:
            return err.messages, 422
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        current_user = current_user.id
        if not 'id' in data:
            return {'status': 'failed', 'data': 'required field ID not provided'}, 422
        category = Category.query.filter_by(
            id=data['id'], user_id=current_user).first()
        if not category:
            return {'status': 'failed', 'data': 'category not found'}, 422
        for field in data:
            print(field)
            if field != 'id':
                print(f'o valor do {field} eh {data[field]}')
                if field == 'stack' and data[field] == False:
                    print(f'Achei! O valor do {field} eh {data[field]}')
                    found = Category.query.filter_by(
                        parentstack=data['id'], user_id=current_user)
                    for item in found:
                        print(f'Achei: {item}')
                        item.parentstack = None
                    setattr(category, field, data[field])
                elif field == 'stack' and data[field] == True:
                    setattr(category, field, data[field])
                    setattr(category, 'parentstack', None)
                else:
                    setattr(category, field, data[field])
        db.session.commit()
        result = category_schema.dump(category)
        return {'status': 'success', 'data': result}, 201

    # delete category
    @jwt_required()
    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = category_schema.load(json_data, partial=('name',))
        except ValidationError as err:
            return err.messages, 422
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        current_user = current_user.id
        category = Category.query.filter_by(
            id=data['id'], user_id=current_user).first()
        if not category:
            return {'status': 'failed', 'data': 'category not found'}, 422
        found = Category.query.filter_by(
            parentstack=data['id'], user_id=current_user)
        if found:
            for item in found:
                print(f'Achei: {item}')
                item.parentstack = None
            db.session.commit()

        category = Category.query.filter_by(
            id=data['id'], user_id=current_user).delete()
        # except:
        #     return {'status': 'failed'}, 422
        db.session.commit()
        result = category_schema.dump(category)
        return {'status': 'success', 'data': result}, 201


# the Resource for listing all categories from a given user:


class Categories(Resource):
    @jwt_required()
    def get(self):
        # get current user
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        # querying the categories by user_id
        categories = Category.query.filter_by(user_id=current_user)
        categories = categories_schema.dump(categories)
        return {'status': 'success', 'data': categories}, 200


class Tags(Resource):
    # retrieving tags
    @jwt_required()
    def get(self):
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        tags = Tag.query.filter_by(user_id=current_user)
        tags = tags_schema.dump(tags)
        return {'status': 'success', 'data': tags}, 200
    # creating tags
    @jwt_required()
    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = tag_schema.load(json_data)
        except ValidationError as err:
            return err.messages, 422
        tag = Tag.query.filter_by(name=data['name']).first()
        if tag:
            return {'message': 'Tag already exists'}, 400
        slug = slugify(json_data['name'])
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        tag = Tag(
            name=json_data['name'], slug=slug, user_id=current_user)
        db.session.add(tag)
        db.session.commit()
        result = tag_schema.dump(tag)
        return {'status': 'success', 'data': result}, 201
    # updating tags
    @jwt_required()
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = tag_schema.load(json_data)
        except ValidationError as err:
            return err.messages, 422
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        tag = Tag.query.filter_by(id=data['id'], user_id=current_user).first()
        if not tag:
            return {'message': 'Tag does not exist'}, 400
        slug = slugify(json_data['name'])
        tag.slug = slug
        tag.name = data['name']
        db.session.commit()
        result = tag_schema.dump(tag)
        return {'status': 'success', 'data': result}, 201
    # delete tags
    @jwt_required()
    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = tag_schema.load(json_data, partial=('name',))
        except ValidationError as err:
            return err.messages, 422
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        tag = Tag.query.filter_by(id=data['id'], user_id=current_user).delete()
        db.session.commit()
        result = tag_schema.dump(tag)
        return {'status': 'success', 'data': result}, 201


class Notes(Resource):
    # retrieving single note
    @jwt_required()
    def get(self):
        try:
            noteId = request.args.get('id')
        except:
            return {'status': 'Couldnt Retrieve Note'}, 400
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        print(noteId)
        if noteId != None:
            note = Note.query.filter_by(
                id=noteId, user_id=current_user).first()
            note = noteshow_schema.dump(note)
            return {'status': 'success', 'data': note}, 200
        else:
            return {'status': 'Couldnt Retrieve Note'}, 400
    # creating note
    @jwt_required()
    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400

        try:
            data = note_schema.load(json.loads(json.dumps(json_data)))
        except ValidationError as err:
            return err.messages, 422
        note = Note.query.filter_by(
            title=data['title'], category_id=json_data['category_id']).first()
        if note:
            return {'status': 'Note already exists'}, 400
        slug = slugify(json_data['title'])
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        if "tags" in json_data:
            tagsfromjson = notetag_schema.load(
                json.loads(json.dumps(json_data['tags'])))
            tagsList = []
            for tag in tagsfromjson:
                print(f'essa eh a tag: {tag["name"]}')
                tagCheck = Tag.query.filter_by(name=tag["name"]).first()
                if tagCheck:
                    tagsList.append(tagCheck)
                else:
                    slugTag = slugify(tag['name'])
                    tagCreation = Tag(
                        name=tag['name'], slug=slugTag, user_id=current_user)
                    db.session.add(tagCreation)
                    db.session.commit()
                    result = tag_schema.dump(tagCreation)
                    tagsList.append(tagCreation)

        else:
            tagsList = []
        print(f'essa eh a tagsList {tagsList}')
        note = Note(
            title=json_data['title'], slug=slug, user_id=current_user, content=json_data['content'], category_id=json_data['category_id'], tags=tagsList)
        print(note)
        db.session.add(note)
        db.session.commit()
        result = noteshow_schema.dump(note)
        return {'status': 'success', 'data': result}, 201
    # updating notes
    @jwt_required()
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = note_schema.load(json.loads(json.dumps(json_data)))
        except ValidationError as err:
            return err.messages, 422
        note = Note.query.filter_by(id=data['id']).first()
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        current_user = current_user.id
        if not note:
            return {'message': 'Note does not exist'}, 400
        if "tags" in json_data:
            tagsfromjson = notetag_schema.load(
                json.loads(json.dumps(json_data['tags'])))
            tagsList = []
            for tag in tagsfromjson:
                tagCheck = Tag.query.filter_by(name=tag["name"]).first()
                if tagCheck:
                    tagsList.append(tagCheck)
                else:
                    slugTag = slugify(tag['name'])
                    tagCreation = Tag(
                        name=tag['name'], slug=slugTag, user_id=current_user)
                    db.session.add(tagCreation)
                    db.session.commit()
                    result = tag_schema.dump(tagCreation)
                    tagsList.append(tagCreation)
        else:
            tagsList = []
        slug = slugify(json_data['title'])
        note.tags = tagsList
        note.slug = slug
        note.title = data['title']
        note.content = data['content']
        note.category_id = data['category_id']
        note.favorite = data['favorite']
        note.tags = tagsList
        db.session.commit()
        result = noteshow_schema.dump(note)
        return {'status': 'success', 'data': result}, 201
    # patch note
    @jwt_required()
    def patch(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = note_schema.load(json_data, partial=('title', "content",))
        except ValidationError as err:
            return err.messages, 422
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        note = Note.query.filter_by(
            id=data['id'], user_id=current_user).first()
        for field in data:
            print(field)
            if field != 'id':
                print(f'o valor do {field} eh {data[field]}')
                setattr(note, field, data[field])
        db.session.commit()
        result = note_schema.dump(note)
        return {'status': 'success', 'data': result}, 201
    # delete note
    @jwt_required()
    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        try:
            data = note_schema.load(json_data, partial=('title', "content",))
        except ValidationError as err:
            return err.messages, 422
        note = Note.query.filter_by(
            id=data['id'], user_id=current_user).delete()
        db.session.commit()
        result = note_schema.dump(note)
        return {'status': 'success', 'data': result}, 201


class NotesCat(Resource):
    # retrieving single note
    @jwt_required()
    def get(self):
        try:
            catId = request.args.get('catid')
        except:
            return {'status': 'No category ID provided'}, 400
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        if catId != None:
            if catId == "all":
                note = Note.query.filter_by(user_id=current_user).order_by(
                    desc(Note.created_on)).all()
            else:
                note = Note.query.filter_by(
                    category_id=catId, user_id=current_user).order_by(desc(Note.created_on))
            note = notecat_schema.dump(note)
            return {'status': 'success', 'data': note}, 200
        else:
            return {'status': 'No valid category ID provided'}, 400

class NotesFav(Resource):
    # retrieving only the favorite notes
    @jwt_required()
    def get(self):
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        note = Note.query.filter_by(
            favorite=True, user_id=current_user).order_by(desc(Note.created_on))
        note = notecat_schema.dump(note)
        return {'status': 'success', 'data': note}, 200


class LatestNotes(Resource):
    # retrieving the last 5 articles
    @jwt_required()
    def get(self):
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        current_user = current_user.id
        note = Note.query.filter_by(user_id=current_user).order_by(
            desc(Note.created_on)).limit(5)
        note = notecat_schema.dump(note)
        return {'status': 'success', 'data': note}, 200


class UserProfile(Resource):
    @jwt_required()
    def get(self):
        current_user = User.query.filter_by(
            email=get_jwt_identity()).first()
        user = userprofile_schema.dump(current_user)
        return {'status': 'success', 'data': user}, 200
    # patch category
    @jwt_required()
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = userprofile_schema.load(json_data, partial=('name',))
        except ValidationError as err:
            return err.messages, 422
        current_user = User.query.filter_by(email=get_jwt_identity()).first()

        print(data)
        if 'name' in data:
            current_user.name = data['name']
            db.session.commit()
            result = userprofile_schema.dump(current_user)
            return {'status': 'success', 'data': result}, 201
        if 'picture' in data:
            current_user.picture = data['picture']
            db.session.commit()
            result = userprofile_schema.dump(current_user)
            return {'status': 'success', 'data': result}, 201


class ChangePwd(Resource):
    @jwt_required()
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
            return {'message': 'No input data provided'}, 400
        try:
            data = changepwd_schema.load(json_data)
        except ValidationError as err:
            return err.messages, 422
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        if User.verify_hash(data['currpwd'], current_user.password):
            password = User.generate_hash(data['newpwd'])
            current_user.password = password
            db.session.commit()
            return {'status': 'success', 'message': 'Password changed!'}, 201
        else:
            return {'status': 'fail', 'message': 'Wrong current password'}


class SearchNotes(Resource):
    @jwt_required()
    def get(self):
        try:
            searchTerm = request.args.get('search')
        except:
            return {'status': 'No search query provided'}, 400
        current_user = User.query.filter_by(email=get_jwt_identity()).first()
        current_user = current_user.id
        search = "%{}%".format(searchTerm)
        # results = Note.query.filter(Note.user_id == current_user, Note.content.like(
        #     '%' + searchTerm + '%') | Note.user_id == current_user, Note.title.like('%' + searchTerm + '%') | Note.user_id == current_user, Note.tags.has(name.like('%' + searchTerm + '%'))).all()
        # results = Note.query.filter(Note.user_id == current_user, Note.content.like(search) |
        #                             Note.user_id == current_user, Note.title.like(search) | Note.user_id == current_user, Note.tags.any(name=searchTerm)).all()
        # results = Note.query.filter(Note.user_id == current_user, Note.content.like(
        #     search) | Note.user_id == current_user, Note.title.like(search) | Note.user_id == current_user, Note.tags.any(name=searchTerm)).all()
        # results = Note.query.filter(
        #     Note.user_id == current_user, Note.content.like(search)).all()
        results = Note.query.filter(and_(Note.user_id == current_user, Note.content.like(search)) |
                                    and_(Note.user_id == current_user, Note.title.like(search)) | and_(Note.user_id == current_user, Note.tags.any(name=searchTerm))).all()
        results = search_schema.dump(results)
        return {'status': 'success', 'data': results}, 200


class NoteDisplayPictureResource(Resource):
    @jwt_required()
    def put(self):
        print(request.files)
        if "file" not in request.files:
            return {"message": "no file"}, 400
        uploaded_file = request.files["file"]
        # Check if the file is one of the allowed types/extensions
        if isinstance(uploaded_file, FileStorage) and allowed_file(uploaded_file.filename):
            # Make the filename safe, remove unsupported chars
            filename = secure_filename(uploaded_file.filename)
            current_user = User.query.filter_by(
                email=get_jwt_identity()).first()
            current_user_email = current_user.email
            current_user = current_user.id

            # for further security checks
            mimetype = uploaded_file.content_type
            if mimetype not in app.config["ALLOWED_MIMETYPES_EXTENSIONS"]:
                return ({"message": "File type not allowed, upload png, jpeg, svg files"}, 400)
            targetDir = os.path.join(
                app.config["UPLOAD_FOLDER"], str(
                    hashString(current_user_email))
            )
            target = os.path.join(
                app.config["UPLOAD_FOLDER"], str(
                    hashString(current_user_email)), filename
            )
            os.makedirs(targetDir, exist_ok=True)
            uploaded_file.save(target)

            picture = Image.open(target)
            picture.thumbnail([sys.maxsize, 600], Image.ANTIALIAS)
            picture.save(target, optimize=True, quality=50)
            imageUrl2 = url_for('static', filename=str(hashString(
                current_user_email)) + "/" + filename, _external=True)
            print(imageUrl2)
            return {'status': 'success', 'data': imageUrl2}, 200
        return ({'status': 'failed', 'message': 'An error occured'}, 400)
