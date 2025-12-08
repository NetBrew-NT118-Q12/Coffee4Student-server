FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5001/health')"

# Run application
CMD ["python", "api/app.py"]




# docker run -d \
#   --name coffee-ai \
#   --restart unless-stopped \
#   -p 127.0.0.1:5001:5001 \
#   --env-file ~/projects/Coffee4Student-server/ai-recommendation/.env \
#   coffee-ai:latest
