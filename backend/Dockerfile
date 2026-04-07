# Sử dụng image Python 3.12 chính thức
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Đặt thư mục làm việc
WORKDIR /app

# Cài đặt các dependencies hệ thống (nếu cần)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt
COPY requirements.txt .

# Cài đặt Python dependencies
RUN pip install --no-cache-dir --prefer-binary --no-compile -r requirements.txt

# Copy toàn bộ mã backend
COPY . .

# Expose port (mặc định FastAPI dùng 8000)
EXPOSE 8000

# Health check (tùy chọn)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health', timeout=5.0)"

# Command chạy ứng dụng
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]