#!/bin/bash
set -e

echo "build whitebook-backend prod..."
docker-compose -f docker-compose.prod.yml build
