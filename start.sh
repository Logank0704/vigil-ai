#!/bin/bash

echo "🚀 Starting Vigil AI..."
docker-compose up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 10

echo "🌱 Seeding database..."
docker-compose exec -T backend npm run prisma:seed

echo "✅ Setup complete!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🔐 Login credentials:"
echo "   Admin:   admin@cyberdyne.com / admin123"
echo "   Analyst: analyst@cyberdyne.com / analyst123"
echo ""
echo "📊 View logs: docker-compose logs -f"

