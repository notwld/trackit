from datetime import datetime
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
    
    # Specify that 'contacts' uses the user_id column as the foreign key
    contacts = db.relationship('Contact', foreign_keys='Contact.user_id', backref='user', lazy=True)

    def set_password(self, password):
        """Hash the user's password."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')

    def __init__(self, full_name, email, password, profile_pic=None):
        self.full_name = full_name
        self.email = email
        self.set_password(password) 
        self.profile_pic = profile_pic

class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key for the owner of the inbox (user who owns the contact)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  
    
    # Foreign key for the contact user (the other user in the conversation)
    contact_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  
    
    # Each contact will have one conversation
    conversation = db.relationship('Conversation', backref='contact', lazy=True, uselist=False)

    def __init__(self, user_id, contact_user_id):
        self.user_id = user_id
        self.contact_user_id = contact_user_id

class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    contact_id = db.Column(db.Integer, db.ForeignKey('contact.id'), nullable=False)
    
    # Each conversation will have multiple messages
    messages = db.relationship('Message', backref='conversation', lazy=True)

    started_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __init__(self, contact_id):
        self.contact_id = contact_id

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Sender of the message
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    sender = db.relationship('User', backref='sent_messages', lazy=True)

    def __init__(self, conversation_id, sender_id, content):
        self.conversation_id = conversation_id
        self.sender_id = sender_id
        self.content = content


class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
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
