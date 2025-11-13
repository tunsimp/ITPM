#!/usr/bin/env python3
"""
Flask API for EduSoft Grade Scraper
Lightweight API to retrieve grades from EduSoft portal
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import the scraper class from script.py
from script import EdusoftScraper

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'EduSoft Grade Scraper API'
    }), 200


@app.route('/api/grades', methods=['POST'])
def get_grades():
    """
    Retrieve grades from EduSoft portal
    
    Request body (JSON):
    {
        "username": "ITITIU22177",
        "password": "your_password"
    }
    
    Returns:
    {
        "success": true/false,
        "data": {
            "student_info": {...},
            "grades": [...],
            "last_updated": "..."
        },
        "message": "..."
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        
        # Validate input
        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Username and password are required'
            }), 400
        
        # Create scraper instance
        scraper = EdusoftScraper()
        
        # Login
        login_success = scraper.login(username, password)
        
        if not login_success:
            return jsonify({
                'success': False,
                'message': 'Login failed. Please check your credentials.'
            }), 401
        
        # Get grades
        grades_data = scraper.get_grades()
        
        # Log for debugging
        logger.info(f"Grades data received: {bool(grades_data)}")
        if grades_data:
            logger.info(f"Student info keys: {list(grades_data.get('student_info', {}).keys())}")
            logger.info(f"Number of grades: {len(grades_data.get('grades', []))}")
        
        # Check if we got any data at all
        if not grades_data:
            return jsonify({
                'success': False,
                'message': 'Failed to retrieve grades data from the server'
            }), 500
        
        # Check if we have student info but no grades (might be valid - student might not have grades yet)
        if grades_data.get('student_info') and not grades_data.get('grades'):
            return jsonify({
                'success': True,
                'data': grades_data,
                'message': 'Student information retrieved, but no grades found. This might be normal if the student has no grades yet.'
            }), 200
        
        # Check if we have neither student info nor grades
        if not grades_data.get('student_info') and not grades_data.get('grades'):
            return jsonify({
                'success': False,
                'data': grades_data,  # Return what we got for debugging
                'message': 'Failed to parse student information and grades. The page structure might have changed.'
            }), 500
        
        return jsonify({
            'success': True,
            'data': grades_data,
            'message': 'Grades retrieved successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in get_grades: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@app.route('/api/login', methods=['POST'])
def login():
    """
    Test login endpoint (doesn't return grades, just verifies credentials)
    
    Request body (JSON):
    {
        "username": "ITITIU22177",
        "password": "your_password"
    }
    
    Returns:
    {
        "success": true/false,
        "message": "..."
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'Request body is required'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({
                'success': False,
                'message': 'Username and password are required'
            }), 400
        
        scraper = EdusoftScraper()
        login_success = scraper.login(username, password)
        
        if login_success:
            return jsonify({
                'success': True,
                'message': 'Login successful'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Login failed. Please check your credentials.'
            }), 401
            
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'An error occurred: {str(e)}'
        }), 500


@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500


if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    # Get host from environment variable or default to 0.0.0.0 (all interfaces)
    host = os.environ.get('HOST', '0.0.0.0')
    
    print(f"🚀 Starting EduSoft Grade Scraper API on {host}:{port}")
    app.run(host=host, port=port, debug=False)

