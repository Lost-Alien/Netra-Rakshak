#!/bin/bash
# =============================================================================
# NETRA RAKSHAK — AWS EC2 Auto-Setup Script
# Run this ONCE on a fresh Amazon Linux 2023 / Ubuntu 22.04 EC2 t2.micro
# Usage: bash setup.sh YOUR_HUGGINGFACE_MODEL_URL
# =============================================================================

set -e

MODEL_URL="${1:-}"
if [ -z "$MODEL_URL" ]; then
    echo "ERROR: Please provide the model URL as argument."
    echo "Usage: bash setup.sh https://huggingface.co/YOUR_USER/Netra-Rakshak-ONNX/resolve/main/netra_rakshak.onnx"
    exit 1
fi

echo "============================================================"
echo "  NETRA RAKSHAK Backend — AWS EC2 Setup"
echo "============================================================"

# ── 1. Detect OS and install system packages ──────────────────
echo "[1/7] Installing system dependencies..."
if command -v apt-get &>/dev/null; then
    # Ubuntu / Debian
    sudo apt-get update -q
    sudo apt-get install -y -q python3.11 python3.11-venv python3-pip git curl libgl1
    PYTHON=python3.11
elif command -v dnf &>/dev/null; then
    # Amazon Linux 2023
    sudo dnf update -y -q
    sudo dnf install -y -q python3.11 python3.11-pip git curl mesa-libGL
    PYTHON=python3.11
else
    echo "Unsupported OS. Use Amazon Linux 2023 or Ubuntu 22.04."
    exit 1
fi

# ── 2. Clone / update the repo ────────────────────────────────
echo "[2/7] Setting up application files..."
APP_DIR="/opt/netra_rakshak"
sudo mkdir -p "$APP_DIR"
sudo chown "$USER:$USER" "$APP_DIR"

# Copy backend files from this script's directory (if run from repo)
# or download from GitHub
if [ -f "$(dirname "$0")/main.py" ]; then
    cp "$(dirname "$0")"/{main.py,requirements.txt} "$APP_DIR/"
else
    echo "Downloading backend from GitHub..."
    curl -sSL "https://raw.githubusercontent.com/Lost-Alien/Netra-Rakshak/main/backend/main.py" -o "$APP_DIR/main.py"
    curl -sSL "https://raw.githubusercontent.com/Lost-Alien/Netra-Rakshak/main/backend/requirements.txt" -o "$APP_DIR/requirements.txt"
fi

# ── 3. Python virtual environment ─────────────────────────────
echo "[3/7] Creating Python virtual environment..."
cd "$APP_DIR"
$PYTHON -m venv venv
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
deactivate

# ── 4. Download ONNX model ────────────────────────────────────
echo "[4/7] Downloading ONNX model (~94MB)..."
MODEL_PATH="$APP_DIR/netra_rakshak.onnx"
if [ -f "$MODEL_PATH" ]; then
    echo "  Model already exists, skipping download."
else
    curl -L --progress-bar "$MODEL_URL" -o "$MODEL_PATH"
    echo "  Model downloaded to $MODEL_PATH"
fi

# ── 5. Write environment file ──────────────────────────────────
echo "[5/7] Writing environment config..."
cat > "$APP_DIR/.env" <<EOF
LOCAL_MODEL_PATH=$MODEL_PATH
MODEL_URL=$MODEL_URL
EOF

# ── 6. Create systemd service (auto-start on reboot) ──────────
echo "[6/7] Installing systemd service..."
sudo tee /etc/systemd/system/netra-rakshak.service > /dev/null <<EOF
[Unit]
Description=Netra Rakshak FastAPI Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
ExecStart=$APP_DIR/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable netra-rakshak
sudo systemctl start netra-rakshak

# ── 7. Install Nginx as reverse proxy ─────────────────────────
echo "[7/7] Setting up Nginx reverse proxy..."
if command -v apt-get &>/dev/null; then
    sudo apt-get install -y -q nginx
else
    sudo dnf install -y -q nginx
fi

sudo tee /etc/nginx/conf.d/netra_rakshak.conf > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 120s;
    }
}
NGINX

sudo systemctl enable nginx
sudo systemctl restart nginx

# ── Done ──────────────────────────────────────────────────────
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "YOUR_EC2_IP")

echo ""
echo "============================================================"
echo "  ✅ NETRA RAKSHAK BACKEND DEPLOYED SUCCESSFULLY"
echo "============================================================"
echo ""
echo "  Backend URL : http://$PUBLIC_IP/predict"
echo "  Health check: http://$PUBLIC_IP/health"
echo ""
echo "  Service status: sudo systemctl status netra-rakshak"
echo "  View logs     : sudo journalctl -u netra-rakshak -f"
echo ""
echo "  NEXT STEP: Add this to Vercel environment variables:"
echo "    VITE_NETRA_API_URL = http://$PUBLIC_IP/predict"
echo "============================================================"
