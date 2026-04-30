from flask import Flask, request, jsonify
from analyzer import analyze_resume

app = Flask(__name__)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/analyze', methods=['POST'])
def analyze():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400

    target_job = request.form.get('target_job', '')
    if not target_job:
        return jsonify({'error': 'target_job is required'}), 400

    job_description = request.form.get('job_description', '')

    file = request.files['resume']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported'}), 400

    try:
        file_bytes = file.read()
        result = analyze_resume(file_bytes, target_job, job_description)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)
