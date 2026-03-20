# Docker Hub Deployment Script

## Step 1: Create Docker Hub Account
Go to https://hub.docker.com and create a free account

## Step 2: Login to Docker Hub
```bash
docker login
# Enter your Docker Hub username and password
```

## Step 3: Tag Your Images
```bash
# Replace 'yourusername' with your Docker Hub username
docker tag forest_emergency_communication-backend:latest yourusername/fecs-backend:latest
docker tag forest_emergency_communication-frontend:latest yourusername/fecs-frontend:latest
```

## Step 4: Push Images to Docker Hub
```bash
docker push yourusername/fecs-backend:latest
docker push yourusername/fecs-frontend:latest
```

## Step 5: Share with Friends

Create a simple docker-compose.yml for your friends:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16.13
    container_name: fecs_postgres
    environment:
      POSTGRES_DB: fecs_db
      POSTGRES_USER: fecs_user
      POSTGRES_PASSWORD: fecs_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - fecs_network

  mosquitto:
    image: eclipse-mosquitto:latest
    container_name: fecs_mosquitto
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - mosquitto_data:/mosquitto/data
      - mosquitto_logs:/mosquitto/log
    networks:
      - fecs_network

  backend:
    image: yourusername/fecs-backend:latest  # Your Docker Hub image
    container_name: fecs_backend
    environment:
      DATABASE_URL: postgresql+psycopg://fecs_user:fecs_password@postgres:5432/fecs_db
      MQTT_BROKER_HOST: mosquitto
      MQTT_BROKER_PORT: 1883
      MQTT_INCOMING_TOPIC: fecs/incoming
      MQTT_ACK_TOPIC: fecs/ack
      SECRET_KEY: your-secret-key-change-in-production
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 1440
      DUPLICATE_TIME_THRESHOLD_SECONDS: 10
      DUPLICATE_DISTANCE_THRESHOLD_METERS: 10
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - mosquitto
    networks:
      - fecs_network

  frontend:
    image: yourusername/fecs-frontend:latest  # Your Docker Hub image
    container_name: fecs_frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - fecs_network
    environment:
      REACT_APP_API_URL: http://localhost:8000
      REACT_APP_WS_URL: ws://localhost:8000

volumes:
  postgres_data:
  mosquitto_data:
  mosquitto_logs:

networks:
  fecs_network:
    driver: bridge
```

## Your Friends Run:
```bash
# Create mosquitto config folder
mkdir -p mosquitto/config

# Create mosquitto.conf
echo "listener 1883
allow_anonymous true
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
log_dest stdout" > mosquitto/config/mosquitto.conf

# Pull and run
docker compose pull
docker compose up -d
```

## Access:
- Frontend: http://localhost:3000
- Login: admin / admin123
