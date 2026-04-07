#!/bin/bash
# GreenPulse — Quick Start Script

set -e
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}"
echo "  ██████╗ ██████╗ ███████╗███████╗███╗   ██╗██████╗ ██╗   ██╗██╗     ███████╗███████╗"
echo "  ██╔════╝ ██╔══██╗██╔════╝██╔════╝████╗  ██║██╔══██╗██║   ██║██║     ██╔════╝██╔════╝"
echo "  ██║  ███╗██████╔╝█████╗  █████╗  ██╔██╗ ██║██████╔╝██║   ██║██║     ███████╗█████╗  "
echo "  ██║   ██║██╔══██╗██╔══╝  ██╔══╝  ██║╚██╗██║██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝  "
echo "  ╚██████╔╝██║  ██║███████╗███████╗██║ ╚████║██║     ╚██████╔╝███████╗███████║███████╗"
echo "   ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝"
echo -e "${NC}"
echo -e "${BLUE}AI-Powered Micro-Climate & Commute Optimizer${NC}"
echo ""

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌ Python3 not found. Please install Python 3.9+."
  exit 1
fi

# Setup backend
echo -e "${YELLOW}[1/4] Setting up backend…${NC}"
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠️  Created backend/.env — add your GEMINI_API_KEY and OPENWEATHERMAP_API_KEY${NC}"
fi

if [ ! -d "venv" ]; then
  python3 -m venv venv
fi

source venv/bin/activate
echo -e "${YELLOW}[2/4] Installing dependencies…${NC}"
pip install -r requirements.txt -q

echo -e "${YELLOW}[3/4] Starting FastAPI backend on http://localhost:8000${NC}"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..

sleep 2

# Serve frontend
echo -e "${YELLOW}[4/4] Starting frontend on http://localhost:3000${NC}"
cd frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ GreenPulse is running!${NC}"
echo ""
echo -e "  🌿  Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "  ⚡  Backend:   ${BLUE}http://localhost:8000${NC}"
echo -e "  📖  API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services.${NC}"
echo ""

# Graceful shutdown
trap "echo ''; echo 'Stopping GreenPulse…'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

wait
