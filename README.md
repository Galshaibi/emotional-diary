# Emotional Diary - SaaS Application

A modern web application for managing daily emotional diaries, designed for both patients and therapists.

## Features

- Secure user authentication with 2FA
- Daily emotional tracking with customizable emotions
- Medication tracking
- Behavioral monitoring
- Analytics dashboard for patients and therapists
- Automated notifications and reminders
- GDPR/HIPAA compliant data handling

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: React with Material-UI
- Database: PostgreSQL
- Authentication: JWT with 2FA
- Analytics: Custom charts with MUI X-Charts

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 13+

### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```
DATABASE_URL=postgresql://postgres:postgres@localhost/emotional_diary
SECRET_KEY=your-secret-key
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_FROM=your-email@example.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
```

4. Initialize the database:
```bash
alembic upgrade head
```

5. Run the backend server:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm start
```

## Deployment Instructions

### Prerequisites
- Docker
- Docker Compose
- Git

### Initial Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd emotional-diary
```

2. Create environment file:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration values.

### Development Setup
1. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
cd ..
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
cd ..
```

### Docker Deployment
1. Build and start the containers:
```bash
docker-compose up -d --build
```

2. Initialize the database:
```bash
docker-compose exec backend alembic upgrade head
```

3. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Monitoring
- View logs:
```bash
docker-compose logs -f
```

- Check container status:
```bash
docker-compose ps
```

### Maintenance
- Update containers:
```bash
docker-compose pull
docker-compose up -d
```

- Backup database:
```bash
docker-compose exec db pg_dump -U postgres emotional_diary > backup.sql
```

### Security Notes
1. Always use strong passwords in production
2. Keep the `.env` file secure and never commit it to version control
3. Regularly update dependencies and Docker images
4. Configure SSL/TLS in production
5. Set up proper monitoring and logging

### Production Deployment
For production deployment, additional steps are recommended:
1. Use a proper domain name
2. Configure SSL/TLS certificates
3. Set up monitoring and alerting
4. Configure regular backups
5. Use a production-grade database setup
6. Set up CI/CD pipelines

### Troubleshooting
1. If containers fail to start, check logs:
```bash
docker-compose logs [service-name]
```

2. Reset the environment:
```bash
docker-compose down -v
docker-compose up -d
```

3. Clear Docker cache:
```bash
docker system prune -a
```

For more information or support, please contact the development team.

## Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript/React code
- Write unit tests for new features
- Document API endpoints using FastAPI's automatic documentation

## Security Features

- AES-256 encryption for sensitive data
- RBAC (Role-Based Access Control)
- 2FA authentication
- Secure session management
- Regular security audits

## License

MIT License - See LICENSE file for details
