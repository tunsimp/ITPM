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
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import the scraper class from script.py
from script import EdusoftScraper

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Vietnamese university classification thresholds (4.0 scale)
CLASSIFICATION_THRESHOLDS = {
    'Xuất sắc': {'min': 3.6, 'max': 4.0, 'name_en': 'Excellent'},
    'Giỏi': {'min': 3.2, 'max': 3.59, 'name_en': 'Very Good'},
    'Khá': {'min': 2.5, 'max': 3.19, 'name_en': 'Good'},
    'Trung bình': {'min': 2.0, 'max': 2.49, 'name_en': 'Average'},
    'Yếu': {'min': 0.0, 'max': 1.99, 'name_en': 'Weak'}
}

def calculate_grade_projection(grades_data: dict) -> dict:
    """
    Calculate grade projections based on current cGPA and credits.
    
    Args:
        grades_data: Dictionary containing grades data with 'grades' list
    
    Returns:
        Dictionary with projection information including:
        - current_classification: Current degree classification
        - current_cgpa: Current cumulative GPA (4.0 scale)
        - total_credits: Total credits accumulated
        - projections: Projections for each classification level
    """
    try:
        grades = grades_data.get('grades', [])
        
        if not grades:
            logger.warning("No grades found in grades_data")
            return None
        
        # Extract current cGPA (latest "Điểm trung bình tích lũy (hệ 4)" value)
        current_cgpa = None
        total_credits = None
        
        # Iterate through grades to find the latest cumulative data
        for grade in reversed(grades):
            stt_value = grade.get('STT', '')
            
            # Extract cGPA from "Điểm trung bình tích lũy (hệ 4):X.XX"
            if 'Điểm trung bình tích lũy (hệ 4)' in stt_value and current_cgpa is None:
                # Match number after colon (handle both with and without space)
                # Try multiple patterns to be robust
                patterns = [
                    r':\s*(\d+\.?\d*)',  # Standard pattern
                    r':(\d+\.?\d*)',     # No space after colon
                    r'(\d+\.?\d*)'       # Just the number
                ]
                for pattern in patterns:
                    match = re.search(pattern, stt_value)
                    if match:
                        try:
                            current_cgpa = float(match.group(1))
                            logger.info(f"Extracted cGPA: {current_cgpa} from '{stt_value}'")
                            break
                        except ValueError:
                            logger.error(f"Failed to convert cGPA to float: {match.group(1)}")
            
            # Extract total credits from "Số tín chỉ tích lũy:XXX"
            if 'Số tín chỉ tích lũy' in stt_value and total_credits is None:
                # Match number after colon (handle both with and without space)
                # Try multiple patterns to be robust
                patterns = [
                    r':\s*(\d+)',        # Standard pattern
                    r':(\d+)',           # No space after colon
                    r'(\d+)'             # Just the number
                ]
                for pattern in patterns:
                    match = re.search(pattern, stt_value)
                    if match:
                        try:
                            total_credits = int(match.group(1))
                            logger.info(f"Extracted total credits: {total_credits} from '{stt_value}'")
                            break
                        except ValueError:
                            logger.error(f"Failed to convert credits to int: {match.group(1)}")
            
            # Break if we found both
            if current_cgpa is not None and total_credits is not None:
                break
        
        if current_cgpa is None or total_credits is None:
            logger.warning(f"Failed to extract required data - cGPA: {current_cgpa}, total_credits: {total_credits}")
            return None
        
        # Determine current classification
        current_classification = None
        current_classification_en = None
        for class_name, thresholds in CLASSIFICATION_THRESHOLDS.items():
            if thresholds['min'] <= current_cgpa <= thresholds['max']:
                current_classification = class_name
                current_classification_en = thresholds['name_en']
                break
        
        # Calculate projections for each classification
        # Assume typical program has ~140 credits total
        # Adjust based on actual program requirements if known
        typical_total_credits = 140
        remaining_credits = max(0, typical_total_credits - total_credits)
        
        total_grade_points = current_cgpa * total_credits
        projections = {}
        
        for class_name, thresholds in CLASSIFICATION_THRESHOLDS.items():
            target_gpa = thresholds['min']
            target_name_en = thresholds['name_en']
            
            # Calculate required total grade points for target classification
            if remaining_credits > 0:
                required_total_points = target_gpa * (total_credits + remaining_credits)
                additional_points_needed = required_total_points - total_grade_points
                required_gpa_remaining = additional_points_needed / remaining_credits
                
                # Clamp to prevent negative values (but allow > 4.0 to show impossibility)
                required_gpa_remaining = max(0.0, required_gpa_remaining)
                
                # Determine status
                if class_name == current_classification:
                    status = 'current'
                elif target_gpa > current_cgpa:
                    status = 'higher'
                else:
                    status = 'lower'
                
                projections[class_name] = {
                    'classification_en': target_name_en,
                    'target_min_gpa': target_gpa,
                    'required_gpa_remaining': round(required_gpa_remaining, 2),
                    'remaining_credits': remaining_credits,
                    'achievable': required_gpa_remaining <= 4.0,
                    'status': status
                }
            else:
                # No remaining credits - can't change classification
                # Determine status
                if class_name == current_classification:
                    status = 'current'
                elif target_gpa > current_cgpa:
                    status = 'higher'
                else:
                    status = 'lower'
                
                projections[class_name] = {
                    'classification_en': target_name_en,
                    'target_min_gpa': target_gpa,
                    'required_gpa_remaining': None,
                    'remaining_credits': 0,
                    'achievable': class_name == current_classification,
                    'status': status
                }
        
        return {
            'current_classification': current_classification,
            'current_classification_en': current_classification_en,
            'current_cgpa': round(current_cgpa, 2),
            'total_credits': total_credits,
            'remaining_credits': remaining_credits,
            'projections': projections
        }
        
    except Exception as e:
        logger.error(f"Error calculating grade projection: {str(e)}", exc_info=True)
        return None

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
        
        # Calculate grade projection
        try:
            grade_projection = calculate_grade_projection(grades_data)
            if grade_projection:
                grades_data['grade_projection'] = grade_projection
                logger.info(f"Grade projection calculated successfully: {grade_projection.get('current_classification')}")
            else:
                logger.warning("Grade projection calculation returned None - this may indicate extraction failed")
                # Add a debug field to help troubleshoot
                grades_data['grade_projection_debug'] = {
                    'message': 'Grade projection calculation failed',
                    'grades_count': len(grades_data.get('grades', [])),
                    'has_grades': bool(grades_data.get('grades'))
                }
        except Exception as e:
            logger.error(f"Error in grade projection calculation: {str(e)}", exc_info=True)
            grades_data['grade_projection_error'] = str(e)
        
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

