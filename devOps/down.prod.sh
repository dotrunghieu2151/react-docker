#!/bin/bash
set -e

echo "down whitebook-backend prod..."
docker-compose -f docker-compose.prod.yml down
