#!/bin/bash

# Set file descriptor limits
ulimit -n 4096

echo "🚀 Starting Kanban Calendar MVP..."
echo "📁 Setting file descriptor limit to 4096"

# Kill any existing processes on port 3000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Function to cleanup background processes
cleanup() {
    echo "🛑 Stopping servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server..."
cd backend && npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Backend server running on http://localhost:3000"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend server
echo "📱 Starting frontend server..."
cd ../frontend

# Try to start with increased limits
ulimit -n 4096
npm run web &
FRONTEND_PID=$!

echo ""
echo "🎉 Both servers are starting!"
echo "📊 Backend API: http://localhost:3000/api/health"
echo "🌐 Web App: http://localhost:8081"
echo "📱 Mobile: Scan QR code in terminal or use Expo Go app"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for background processes
wait 