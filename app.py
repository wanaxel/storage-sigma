from flask import Flask, request, send_from_directory, render_template, jsonify, url_for
import os

app = Flask(__name__, static_url_path='/static')


UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


STATIC_FOLDER = 'static'
if not os.path.exists(STATIC_FOLDER):
    os.makedirs(STATIC_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route('/')
def index():
    files = os.listdir(app.config['UPLOAD_FOLDER'])
    return render_template('index.html', files=files)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    file.save(os.path.join(app.config['UPLOAD_FOLDER'], file.filename))
    return jsonify({'message': 'File uploaded successfully', 'filename': file.filename}), 200

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({'success': True, 'message': 'File deleted successfully'}), 200
    return jsonify({'success': False, 'error': 'File not found'}), 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
