#!/bin/bash
set -e

echo "start whitebook-backend prod..."
docker-compose -f docker-compose.prod.yml up --scale app=3 -d
