# EduSoft Grade Scraper API

A lightweight Flask API wrapper for the EduSoft grade scraper script.

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

## Running the API

### Development Mode
```bash
python app.py
```

The API will start on `http://localhost:5000` by default.

### Production Mode
You can use a production WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Environment Variables
- `PORT`: Port number (default: 5000)
- `HOST`: Host address (default: 0.0.0.0)

Example:
```bash
PORT=8000 HOST=0.0.0.0 python app.py
```

## API Endpoints

### 1. Health Check
**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "EduSoft Grade Scraper API"
}
```

### 2. Get Grades
**POST** `/api/grades`

Retrieve student grades from EduSoft portal.

**Request Body:**
```json
{
  "username": "ITITIU22177",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "student_info": {
      "ma_sinh_vien": "...",
      "ten_sinh_vien": "...",
      "lop": "...",
      ...
    },
    "grades": [
      {
        "column_name": "value",
        ...
      }
    ],
    "last_updated": "..."
  },
  "message": "Grades retrieved successfully"
}
```

**Error Responses:**
- `400`: Missing username or password
- `401`: Login failed
- `404`: No grades found
- `500`: Server error

### 3. Test Login
**POST** `/api/login`

Test if credentials are valid (doesn't return grades).

**Request Body:**
```json
{
  "username": "ITITIU22177",
  "password": "your_password"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Error Responses:**
- `400`: Missing username or password
- `401`: Login failed
- `500`: Server error

## Example Usage

### Using cURL
```bash
# Health check
curl http://localhost:5000/health

# Get grades
curl -X POST http://localhost:5000/api/grades \
  -H "Content-Type: application/json" \
  -d '{"username": "ITITIU22177", "password": "your_password"}'

# Test login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "ITITIU22177", "password": "your_password"}'
```

### Using JavaScript (Fetch)
```javascript
// Get grades
fetch('http://localhost:5000/api/grades', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'ITITIU22177',
    password: 'your_password'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Integration with NestJS Backend

You can call this Flask API from your NestJS backend. Example service:

```typescript
// grade.service.ts
import { Injectable, HttpService } from '@nestjs/common';

@Injectable()
export class GradeService {
  constructor(private httpService: HttpService) {}

  async getGrades(username: string, password: string) {
    const response = await this.httpService.post(
      'http://localhost:5000/api/grades',
      { username, password }
    ).toPromise();
    
    return response.data;
  }
}
```

## Notes

- The API runs on a separate host/port from your NestJS backend
- CORS is enabled, so it can be called from any origin
- The scraper maintains sessions using `requests.Session()`
- All form data and ViewState handling is done automatically
- The API returns JSON responses in a consistent format

## Security Considerations

- **Never commit credentials** to version control
- Consider adding **authentication/authorization** to the Flask API
- Use **HTTPS** in production
- Consider adding **rate limiting** to prevent abuse
- Store credentials securely (environment variables, secrets manager)

