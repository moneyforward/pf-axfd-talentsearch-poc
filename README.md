# PF Talent Search

A modern talent search application for finding and matching employees based on skills, experience, and job requirements. Built with React and FastAPI, featuring AI-powered persona generation and intelligent candidate matching.

## Features

- 🔍 **Employee Search**: Search employees by name, email, ID, job title, or department
- 🤖 **AI-Powered Persona Generation**: Generate detailed employee personas using Azure OpenAI
- 🎯 **Smart Matching**: Find similar employees and evaluate candidates based on criteria
- 🌐 **Multi-language Support**: English and Japanese interface
- 🎨 **Modern UI**: Clean, responsive design with smooth animations
- 🐳 **Docker Support**: Easy deployment with Docker Compose

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Azure OpenAI** - AI-powered persona generation
- **Python 3.11+**

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations
- **i18next** - Internationalization
- **Nginx** - Production web server

## Project Structure

```
pf-talentsearch/
├── backend/              # FastAPI backend
│   ├── main.py          # Main application
│   ├── requirements.txt # Python dependencies
│   ├── Dockerfile       # Backend container
│   └── mock-data/       # Sample employee data
├── frontend/            # React frontend
│   ├── src/            # Source code
│   ├── public/         # Static assets
│   ├── Dockerfile      # Frontend container
│   └── package.json    # Node dependencies
├── docker-compose.yml   # Local development setup
└── README.md           # This file
```

## Quick Start

### Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **Docker** (optional, for containerized deployment)

### Option 1: Local Development

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure Azure OpenAI (optional):
   - Create a `.env` file in the `backend/` directory
   - Add your Azure OpenAI credentials:
   ```env
   AZURE_OPENAI_ENDPOINT=https://your-endpoint.azure-api.net/...
   AZURE_OPENAI_API_KEY=your-api-key
   AZURE_OPENAI_API_VERSION=2024-10-21
   AZURE_OPENAI_DEPLOYMENT=gpt-4o
   ```

4. Run the server:
```bash
python main.py
```

The backend will be available at `http://localhost:8080`

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Option 2: Docker Compose (Recommended)

1. Build and start both services:
```bash
docker-compose up --build
```

2. Access the application:
   - Frontend: `http://localhost:80`
   - Backend API: `http://localhost:8000`

3. Stop the services:
```bash
docker-compose down
```

## API Endpoints

### Health & Testing
- `GET /api/health` - Health check endpoint
- `GET /api/test-openai` - Test Azure OpenAI connection

### Employee Search
- `GET /api/people/{query}` - Search employees by name, email, ID, job title, or department
- `POST /api/person/find` - Find employees by persona criteria

### Persona Generation
- `POST /api/persona` - Generate employee persona from data (requires Azure OpenAI)

### Candidate Matching
- `POST /api/search/similar-employees` - Find similar employees to a target
- `POST /api/search/filter` - Filter candidates by hard criteria
- `POST /api/search/evaluate` - Evaluate candidates with scoring
- `POST /api/search/evaluate/stream` - Stream evaluation results (SSE)

## Development

### Backend Development

The backend uses FastAPI with automatic API documentation:
- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`

### Frontend Development

The frontend uses Vite for fast hot module replacement:
- Development server: `http://localhost:5173`
- Build for production: `npm run build`

### Environment Variables

#### Backend
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint URL
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `AZURE_OPENAI_API_VERSION` - API version (default: `2024-10-21`)
- `AZURE_OPENAI_DEPLOYMENT` - Deployment name (default: `gpt-4o`)

#### Frontend
- `BACKEND_URL` - Backend API URL (for Docker Compose)

## Building for Production

### Backend

```bash
cd backend
docker build -t pf-talentsearch-backend:latest -f Dockerfile ..
```

### Frontend

```bash
cd frontend
docker build -t pf-talentsearch-frontend:latest -f Dockerfile .
```

## Deployment

### Docker Compose

For local or server deployment:
```bash
docker-compose up -d
```

### Individual Containers

```bash
# Backend
docker run -p 8000:8000 pf-talentsearch-backend:latest

# Frontend
docker run -p 80:80 pf-talentsearch-frontend:latest
```

## Configuration

### CORS Settings

Update CORS origins in `backend/main.py` if deploying to custom domains:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-domain.com",
        "http://localhost:5173"
    ],
    # ...
)
```

### Nginx Configuration

For production frontend deployment, update `frontend/nginx.conf` to proxy API requests to your backend URL.

## Troubleshooting

### Backend not starting
- Check if port 8080 is available
- Verify Python version (3.11+)
- Ensure all dependencies are installed

### Frontend not connecting to backend
- Verify backend is running on `http://localhost:8080`
- Check CORS settings in backend
- For Docker, ensure services are on the same network

### Azure OpenAI errors
- Verify credentials in `.env` file
- Check endpoint URL format
- Ensure deployment name matches your Azure setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software.

## Support

For issues and questions, please open an issue in the repository.
