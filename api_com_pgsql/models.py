# import db which is SQLAlchemy from run.py:
from run import db, datetime, app
from passlib.hash import pbkdf2_sha256 as sha256
# let's import marshmallow so we dont need to use reqparse which is deprecated now
from marshmallow import Schema, fields, pre_load, validate, ValidationError
from flask_marshmallow import Marshmallow
import zlib
# from flask_sqlalchemy import relationship

# import this for flask-migrate:
# from flask_script import Manager
# from flask_migrate import Migrate, MigrateCommand

ma = Marshmallow()

# initialize migrate
# migrate = Migrate(app, db)
# now work with the script manager for flask-migrate:
# manager = Manager(app)
# finally we need to connect the 2:
# manager.add_command('db', MigrateCommand)

# Custom validator


def must_not_be_blank(data):
    if not data:
        raise ValidationError("Data not provided!")

# determnistic hash funcion


def hashString(string):
    return zlib.adler32(string.encode('utf-8'))

# creating the tables, the class that represent the tables in the database
# first we will start with our user table which will have the following collumns: id, public_id, name, email, password and admin


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.String(50), unique=True)
    name = db.Column(db.String(50))
    email = db.Column(db.String(120), unique=True)
    password = db.Column(db.String(255))
    picture = db.Column(db.String(120), nullable=True, default='')
    admin = db.Column(db.Boolean)
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)
    confirmed = db.Column(db.Boolean, nullable=False, default=False)
    confirmed_on = db.Column(db.DateTime, nullable=True)
    upload_directory = db.Column(db.String(120), unique=True)

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def find_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    @classmethod
    def return_all(cls):
        def to_json(x):
            return {
                'email': x.email,
                'created on:': x.created_on.strftime("%m/%d/%Y, %H:%M:%S"),
                'confirmed:': x.confirmed,
                # 'confirmed on:': x.confirmed_on.strftime("%m/%d/%Y, %H:%M:%S"),
                'password': x.password
            }
        return {'users': list(map(lambda x: to_json(x), User.query.all()))}

    @classmethod
    def delete_all(cls):
        try:
            num_rows_deleted = db.session.query(cls).delete()
            db.session.commit()
            return {'message': '{} row(s) deleted'.format(num_rows_deleted)}
        except:
            return {'message': 'Something went wrong'}

    @staticmethod
    def generate_hash(password):
        return sha256.hash(password)

    @staticmethod
    def verify_hash(password, hash):
        return sha256.verify(password, hash)


class UserSchema(ma.Schema):
    id = fields.Integer()
    email = fields.Str(required=True, validate=validate.Email(
        error="Not a valid email address"))
    name = fields.Str()
    password = fields.Str(required=True, validate=[
                          validate.Length(min=6, max=36)], load_only=True)
    grecaptcharesponse = fields.String(
        required=True, validate=must_not_be_blank)


class UserProfileSchema(ma.Schema):
    id = fields.Integer()
    email = fields.Str()
    name = fields.Str()
    picture = fields.Str()


class ChangePwdSchema(ma.Schema):
    currpwd = fields.Str(required=True, load_only=True)
    newpwd = fields.Str(required=True, validate=[
                        validate.Length(min=6, max=36)], load_only=True)


# let's create our association table which is going to hold our many-to-many relationship,
# note_tags = db.Table('note_tags', db.Column('note_id', db.Integer, db.ForeignKey(
#     'notes.id', ondelete="CASCADE")), db.Column('tag_id', db.Integer, db.ForeignKey('tags.id', ondelete="CASCADE")))

note_tags = db.Table('note_tags', db.Column('note_id', db.Integer, db.ForeignKey(
    'notes.id', ondelete="cascade")), db.Column('tag_id', db.Integer, db.ForeignKey('tags.id', ondelete="cascade")))


class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False)
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)
    # this will define the relationship in the Tag model for our many-to-many relationship between tag and note
    # notes = db.relationship('Note', secondary=note_tags, backref='tags')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    # parents = relationship(
    #     "Note",
    #     secondary=note_tags,
    #     back_populates="children",
    #     passive_deletes=True
    # )


class TagSchema(ma.Schema):
    id = fields.Integer()
    name = fields.String(required=True)
    slug = fields.String()
    created_on = fields.DateTime()
    # notes = fields.Nested(NoteSchema, many=True)


class NoteTagSchema(ma.Schema):
    id = fields.Integer()
    name = fields.String()
# class NoteTagSchema(ma.Schema):
#     id = fields.Integer(required=True)
#     name = fields.String()

# let's create our notes table, it's going to have an id, a title, a slug, a content, a created_on and an updated_on and a Foreign Key to make the one-to-many relationship between this table (Note or notes, which is the child table) and the Category (or categories) table.


class Note(db.Model):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text(), nullable=False)
    favorite = db.Column(db.Boolean, default=False)
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)
    updated_on = db.Column(
        db.DateTime(), default=datetime.utcnow, onupdate=datetime.utcnow)
    category_id = db.Column(db.Integer(), db.ForeignKey(
        'categories.id', ondelete="cascade"))
    # author = db.relationship('User',backref=db.backref('articles'))  # Backreference backref to find all articles made by the author
    # category_name = db.relationship(
    #     'Category', backref=db.backref('category'))
    category_name = db.relationship('Category', back_populates='notes')
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    tags = db.relationship('Tag', secondary=note_tags, backref='notes')
    # children = relationship(
    #     "Tag",
    #     secondary=note_tags,
    #     back_populates="parents",
    #     cascade="all, delete",
    # )

# the note schema


class NoteSchema(ma.Schema):
    id = fields.Integer()
    title = fields.String(required=True)
    slug = fields.String()
    content = fields.String(required=True)
    favorite = fields.Boolean()
    created_on = fields.DateTime()
    updated_on = fields.DateTime()
    category_id = fields.Integer()
    category_name = fields.String()
    tags = fields.Nested(NoteTagSchema, many=True)


# the NoteCatSchema to display notes per category:


class NoteCatSchema(ma.Schema):
    id = fields.Integer()
    title = fields.String()
    slug = fields.String()
    favorite = fields.Boolean()
    created_on = fields.DateTime()
    updated_on = fields.DateTime()
    category_id = fields.Integer()


# special category and note schema to list only note id and title for the categories schema

class CategoryNoteSchema(ma.Schema):
    id = fields.Integer()
    name = fields.String()


# let's create our Category table, it's going to have an id, a name, a slug, a created on and a notes column to define as the parent class on our one-to-many relationship between category (the parent) and note (the child table).

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), nullable=False)
    created_on = db.Column(db.DateTime(), default=datetime.utcnow)
    notes = db.relationship('Note', backref='category')
    stack = db.Column(db.Boolean, default=False)
    parentstack = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))


# special category schema to show category name on noteshowschema:


class NoteCategorySchema(ma.Schema):
    name = fields.String()

# let's create our schema for category so we don't need to use reqparse:


class CategorySchema(ma.Schema):
    id = fields.Integer()
    name = fields.String(required=True)
    slug = fields.String()
    created_on = fields.DateTime()
    stack = fields.Boolean()
    parentstack = fields.Integer()
    notes = fields.Nested(CategoryNoteSchema, many=True)


class CategoriesSchema(ma.Schema):
    id = fields.Integer()
    name = fields.String()
    slug = fields.String()
    stack = fields.Boolean()
    parentstack = fields.Integer()
    created_on = fields.DateTime()

# the NoteShowSchema to show notes with category name:


class NoteShowSchema(ma.Schema):
    id = fields.Integer()
    title = fields.String(required=True)
    slug = fields.String()
    content = fields.String(required=True)
    favorite = fields.Boolean()
    created_on = fields.DateTime()
    updated_on = fields.DateTime()
    category_id = fields.Integer()
    category_name = fields.Nested(NoteCategorySchema)
    tags = fields.Nested(NoteTagSchema, many=True)


class SearchSchema(ma.Schema):
    id = fields.Integer()
    title = fields.Str()
    category_name = fields.Nested(NoteCategorySchema)


# logout functionality model, since we cannot just delete tokens
# (because these tokens still will be valid if they didn't expire),
# in case of user logout, we need to add these tokens to a block list,
# then we will need to check all incoming tokens against this block list
# and if there is a match we will disallow access. this is a simple model
# which stores a primary key id and jti which will be the unique identifier
# of the token. It has also add() method which adds token to the database
# and is_jti_blacklisted() method which do a check if the token is revoked.


class RevokedTokenModel(db.Model):
    __tablename__ = 'revoked_tokens'
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(120))

    def add(self):
        db.session.add(self)
        db.session.commit()

    @classmethod
    def is_jti_blocklisted(cls, jti):
        query = cls.query.filter_by(jti=jti).first()
        return bool(query)


# if __name__ == '__main__':
#     manager.run()
