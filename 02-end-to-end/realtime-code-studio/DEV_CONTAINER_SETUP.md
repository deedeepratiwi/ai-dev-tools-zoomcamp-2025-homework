# Dev Container Setup Guide

Since this project is running inside a VS Code Dev Container, you need to use the special hostname to access the services from your browser on the host machine.

## Accessing Services in Dev Container

### From the Dev Container Terminal

```bash
# These work inside the container
curl http://localhost:3000
curl http://localhost:5000/api/health
```

### From Your Browser on Host Machine

When running in VS Code Dev Container, you have two options:

#### Option 1: Use VS Code Port Forwarding (Recommended)

VS Code automatically detects and forwards ports. Look for the **"Ports"** tab in VS Code:

1. Open VS Code's "Ports" panel (Command Palette → "Ports: Focus on Ports View")
2. You should see:
   - **3000** (Frontend) - Click to open in browser
   - **5000** (Backend API) - Click to test API

#### Option 2: Use Dev Container Hostname

If you're running Docker on the same machine, use:

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000/api`

## Troubleshooting

### "This site can't be reached" Error

**Cause**: Trying to access services before containers are fully started

**Solution**:
```bash
# Check if containers are running
docker-compose ps

# View logs
docker-compose logs frontend
docker-compose logs backend

# Restart services
docker-compose restart
```

### Backend API URL Issues

The frontend needs to communicate with the backend. In `docker-compose.yml`, we set:

```yaml
environment:
  VITE_API_URL: http://localhost:5000/api
```

This is baked into the frontend at build time.

### Testing Endpoints

```bash
# Backend health check
curl http://localhost:5000/api/health

# Get leaderboard
curl http://localhost:5000/api/leaderboard

# Frontend homepage
curl http://localhost:3000/
```

## Running Without Docker (Local Development)

If you prefer to run locally without Docker:

```bash
# Terminal 1 - Frontend
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173

# Terminal 2 - Backend
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

## Useful Docker Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f              # All services
docker-compose logs -f frontend     # Frontend only
docker-compose logs -f backend      # Backend only

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart specific service
docker-compose restart frontend

# Rebuild images
docker-compose build --no-cache

# View networks
docker network ls
docker inspect realtime-code-studio_default
```

## Environment Variables

### Frontend
- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)
- Optional Firebase variables (for real-time sync)

### Backend
- `FLASK_ENV`: development or production
- `FLASK_DEBUG`: True or False
- `DATABASE_URL`: SQLite or PostgreSQL connection string

## Port Mappings

| Service | Container Port | Host Port | Purpose |
|---------|---|---|---|
| Frontend | 3000 | 3000 | React SPA |
| Backend | 5000 | 5000 | REST API |

All ports are mapped to `0.0.0.0` so they're accessible from the host machine.
