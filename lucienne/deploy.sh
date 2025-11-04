#!/bin/bash
echo "🚀 Desplegando contenedor Lucienne..."
docker stop lucienne 2>/dev/null || true
docker rm lucienne 2>/dev/null || true
docker run -d --name lucienne -p 3000:3000 lucienne:latest
echo "✅ Contenedor desplegado correctamente."

