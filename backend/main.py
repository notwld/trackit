import os
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User,Post, bcrypt
from werkzeug.utils import secure_filename
from flask_cors import CORS
from datetime import timedelta

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), "backend",'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max upload size: 16MB
app.config['JWT_SECRET_KEY'] = 'super-secret-key'  # Change this to a strong secret key
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)  # Set token expiration

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Create the database (this only needs to be done once)
with app.app_context():
    db.create_all()

# Allowed extensions for profile pics
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/register', methods=['POST'])
def register():
    if 'full_name' not in request.form or 'email' not in request.form or 'password' not in request.form:
        return jsonify({'error': 'Missing required fields'}), 400
    
    full_name = request.form['full_name']
    email = request.form['email']
    password = request.form['password']
    
    profile_pic = None
    if 'profile_pic' in request.files:
        file = request.files['profile_pic']
        if file and allowed_file(file.filename):
            # Ensure the uploads folder exists
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])
            
            filename = f"{email}_{secure_filename(file.filename)}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            profile_pic = filename
    
    # Check if email is already registered
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    new_user = User(full_name=full_name, email=email, password=password, profile_pic=profile_pic)
    db.session.add(new_user)
    db.session.commit()

    # Generate JWT access token
    access_token = create_access_token(identity=email)

    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,  # Return the access token
        'full_name': new_user.full_name,
        'email': new_user.email,
        'profile_pic': new_user.profile_pic
    }), 201

@app.route('/login', methods=['POST'])
def login():
    if 'email' not in request.form or 'password' not in request.form:
        return jsonify({'error': 'Missing email or password'}), 400

    email = request.form['email']
    password = request.form['password']

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        # Generate JWT access token
        access_token = create_access_token(identity=user.email)
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'full_name': user.full_name,
            'email': user.email,
            'profile_pic': user.profile_pic,
            'role': user.role
        }), 200
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

@app.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()
    profile_pic_url = f"http://127.0.0.1:5000/uploads/{user.profile_pic}" if user.profile_pic else None
    if user:
        return jsonify({
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'profile_pic': profile_pic_url,
            'role': user.role
        }), 200
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    full_name = request.form.get('full_name', user.full_name)
    password = request.form.get('password')
    role = request.form.get('role')
    print(role)
    profile_pic = None

    if 'profile_pic' in request.files:
        file = request.files['profile_pic']
        if file and allowed_file(file.filename):
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])
            
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            profile_pic = filename

    if password:
        user.password = bcrypt.generate_password_hash(password).decode('utf-8')

    user.full_name = full_name
    user.role = role
    if profile_pic:
        user.profile_pic = profile_pic

    db.session.commit()

    return jsonify({
        'message': 'Profile updated successfully',
        'full_name': user.full_name,
        'email': user.email,
        'profile_pic': user.profile_pic,
        'role': user.role
    }), 200
@app.route('/uploads/<filename>', methods=['GET'])
def get_profile_pic(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
@app.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_profile():
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'Profile deleted successfully'}), 200
from datetime import datetime
from flask import request, jsonify

@app.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    data = request.json
    try:
        # Extract data and convert date string to date object
        title = data['title']
        description = data['description']
        source = data['source']
        destination = data['destination']
        space = data['space']
        date_str = data['date']
        
        # Convert the string date to a date object
        date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
        user = User.query.filter_by(email=get_jwt_identity()).first()
        user_id = user.id

        
        # Create a new post object
        new_post = Post(title=title, description=description, source=source,
                        destination=destination, space=space, date=date_obj, user_id=user_id)
        
        # Add the post to the session and commit
        db.session.add(new_post)
        db.session.commit()
        
        return jsonify({'message': 'Post created successfully!'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


# Get All Posts
@app.route('/posts', methods=['GET'])
@jwt_required()
def get_posts():
    post_list = []
    posts = Post.query.all()
    for post in posts:
        author = User.query.filter_by(id=post.user_id).first()
        profile_pic_url = f"http://127.0.0.1:5000/uploads/{author.profile_pic}" if author.profile_pic else None

        post_list.append({
            'id': post.id,
            'title': post.title,
            'description': post.description,
            'source': post.source,
            'destination': post.destination,
            'space': post.space,
            'date': post.date.strftime('%Y-%m-%d'),
            'user_id': post.user_id,
            'author': author.full_name,
            'author_pfp': profile_pic_url
        })
    return jsonify(post_list), 200

# Get sepecific user posts
@app.route('/posts/:user_id', methods=['GET'])
@jwt_required()
def get_user_posts(user_id):
    post_list = []
    posts = Post.query.filter_by(user_id=user_id).all()
    for post in posts:
        author = User.query.filter_by(id=post.user_id).first()
        profile_pic_url = f"http://127.0.0.1:5000/uploads/{author.profile_pic}" if author.profile_pic else None

        post_list.append({
            'id': post.id,
            'title': post.title,
            'description': post.description,
            'source': post.source,
            'destination': post.destination,
            'space': post.space,
            'date': post.date.strftime('%Y-%m-%d'),
            'user_id': post.user_id,
            'author': author.full_name,
            'author_pfp': profile_pic_url
        })
    return jsonify(post_list), 200


# Update Post
@app.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    post = Post.query.filter_by(id=post_id, user_id=user.id).first()

    if not post:
        return jsonify({'error': 'Post not found'}), 404

    post.title = request.json.get('title', post.title)
    post.description = request.json.get('description', post.description)
    post.source = request.json.get('source', post.source)
    post.destination = request.json.get('destination', post.destination)
    post.space = request.json.get('space', post.space)
    post.date = request.json.get('date', post.date)

    db.session.commit()

    return jsonify({'message': 'Post updated successfully'}), 200

# Delete Post
@app.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    current_user = get_jwt_identity()
    user = User.query.filter_by(email=current_user).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    post = Post.query.filter_by(id=post_id, user_id=user.id).first()

    if not post:
        return jsonify({'error': 'Post not found'}), 404

    db.session.delete(post)
    db.session.commit()

    return jsonify({'message': 'Post deleted successfully'}), 200
if __name__ == '__main__':
    app.run(debug=True)
