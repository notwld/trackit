from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    profile_pic = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(20), default='user', nullable=True)
    posts = db.relationship('Post', backref='user', lazy=True)


    def set_password(self, password):
        """Hash the user's password."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
        print(self.password, password)

    def __init__(self, full_name, email, password, profile_pic=None):
        self.full_name = full_name
        self.email = email
        self.set_password(password)  # Hash the password using a separate method
        self.profile_pic = profile_pic

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)  # Use description instead of content
    source = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    space = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __init__(self, title, description, source, destination, space, date, user_id):
        self.title = title
        self.description = description
        self.source = source
        self.destination = destination
        self.space = space
        self.date = date
        self.user_id = user_id