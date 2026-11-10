from flask import Flask, request, jsonify
from flask_cors import CORS
from scorer import get_recommendations
import os

app = Flask(__name__)
CORS(app)

@app.route('/score', methods=['POST'])
def score():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400

        hospitals = data.get('hospitals', [])
        emergency_type = data.get('emergencyType', '')

        if not hospitals or not emergency_type:
            return jsonify({
                'success': False,
                'message': 'hospitals and emergencyType are required'
            }), 400

        ranked = get_recommendations(hospitals, emergency_type)

        return jsonify({
            'success': True,
            'count': len(ranked),
            'data': ranked,
            'recommendation': ranked[0] if ranked else None
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Scoring error occurred'
        }), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'HLERS ML service is running'
    }), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)