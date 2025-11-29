#!/bin/bash
# Quick diagnostic script to check backend status

echo "=== Backend Container Status ==="
docker-compose ps backend

echo -e "\n=== Last 30 Log Lines ==="
docker-compose logs --tail=30 backend

echo -e "\n=== Container Restart Count ==="
docker inspect gradius-backend --format='{{.RestartCount}}'

echo -e "\n=== Container State ==="
docker inspect gradius-backend --format='{{.State.Status}} - {{.State.Error}}'

echo -e "\n=== Run Diagnostic ==="
echo "To run diagnostic inside container:"
echo "docker-compose exec backend node diagnose.js"
