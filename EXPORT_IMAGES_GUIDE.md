# Export and Share Docker Images

## On Your Machine (Export Images)

### Step 1: Save Images to Files
```bash
cd E:\forest_emergency_communication

# Save backend image
docker save forest_emergency_communication-backend:latest -o fecs_backend.tar

# Save frontend image
docker save forest_emergency_communication-frontend:latest -o fecs_frontend.tar

# These files will be large (500MB-1GB each)
```

### Step 2: Create Deployment Package
Create a folder with these files:
```
fecs_deployment/
├── fecs_backend.tar
├── fecs_frontend.tar
├── docker-compose.yml
├── mosquitto/
│   └── config/
│       └── mosquitto.conf
└── README.txt
```

### Step 3: Share the Package
- Upload to Google Drive / OneDrive / Dropbox
- Share via USB drive
- Transfer via network

---

## For Your Friends (Import and Run)

### Step 1: Load Images
```bash
cd fecs_deployment

# Load backend image
docker load -i fecs_backend.tar

# Load frontend image
docker load -i fecs_frontend.tar
```

### Step 2: Run Application
```bash
docker compose up -d
```

### Step 3: Access
- Frontend: http://localhost:3000
- Login: admin / admin123

---

## Quick Commands

### Export Everything (Run this on your machine)
```bash
# Create deployment folder
mkdir fecs_deployment
cd fecs_deployment

# Save images
docker save forest_emergency_communication-backend:latest -o fecs_backend.tar
docker save forest_emergency_communication-frontend:latest -o fecs_frontend.tar

# Copy necessary files
copy ..\docker-compose.yml .
mkdir mosquitto\config
copy ..\mosquitto\config\mosquitto.conf mosquitto\config\

echo "FECS Deployment Package Ready!"
echo "Share the 'fecs_deployment' folder with your friends"
```

### Import and Run (Your friends run this)
```bash
cd fecs_deployment

# Load images
docker load -i fecs_backend.tar
docker load -i fecs_frontend.tar

# Start application
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f
```

---

## File Sizes (Approximate)
- fecs_backend.tar: ~800MB
- fecs_frontend.tar: ~600MB
- Total: ~1.4GB

## Compression (Optional)
To reduce file size:
```bash
# Compress
tar -czf fecs_images.tar.gz fecs_backend.tar fecs_frontend.tar

# Your friends decompress
tar -xzf fecs_images.tar.gz
```
