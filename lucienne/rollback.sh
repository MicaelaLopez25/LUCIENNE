#!/bin/bash
echo "↩️ Restaurando versión anterior..."
docker stop lucienne 2>/dev/null || true
docker rm lucienne 2>/dev/null || true
docker run -d --name lucienne -p 3000:3000 lucienne:previous
echo "✅ Rollback completado."
