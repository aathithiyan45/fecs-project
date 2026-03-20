# Forest Emergency Communication System (FECS)

## Project Overview
FECS is an offline emergency communication system for forest and remote terrain environments. The application layer receives alerts from hardware modules via MQTT, validates and stores them in PostgreSQL, and displays them on a real-time dashboard.

## Technology Stack

### Backend
- FastAPI
- PostgreSQL 16.13
- SQLAlchemy + Alembic
- MQTT (Mosquitto)
- JWT Authentication

### Frontend
- React.js
- Leaflet (map visualization)
- WebSocket (real-time updates)

## Project Structure

```
forest_emergency_communication/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Configuration settings
│   │   ├── database.py          # Database connection
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── mqtt_handler.py      # MQTT subscriber
│   │   ├── services/
│   │   │   ├── alert_service.py # Alert logic
│   │   │   ├── ack_service.py   # ACK publishing
│   │   │   └── auth_service.py  # Authentication
│   │   └── api/
│   │       ├── routes.py        # REST endpoints
│   │       └── websocket.py     # WebSocket manager
│   ├── alembic/                 # Database migrations
│   │   └── versions/            # Migration scripts
│   ├── requirements.txt         # Python dependencies
│   ├── alembic.ini              # Alembic configuration
│   └── .env                     # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main application component
│   │   ├── components/
│   │   │   ├── Login.jsx        # Login page
│   │   │   ├── AdminDashboard.jsx        # Admin dashboard
│   │   │   ├── OperatorDashboard.jsx     # Operator dashboard
│   │   │   ├── Map.jsx                   # Map visualization
│   │   │   ├── AlertList.jsx             # Alert list view
│   │   │   ├── AlertDetail.jsx           # Alert details
│   │   │   ├── AlertLogs.jsx             # Alert history
│   │   │   ├── DeviceRegistration.jsx    # Device registration
│   │   │   ├── BaseStationView.jsx       # Base station management
│   │   │   └── UserManagement.jsx        # User management
│   │   └── services/
│   │       ├── api.js           # API client
│   │       └── websocket.js     # WebSocket client
│   ├── package.json             # Node dependencies
│   └── .env                     # Frontend environment variables
├── README.md                    # Project documentation
├── .gitignore                   # Git ignore rules
└── Documentation files (.txt, .docx)
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 16+
- PostgreSQL 16.13
- Mosquitto MQTT Broker

### 1. Install Mosquitto (MQTT Broker)

**Windows:**
```bash
# Download from: https://mosquitto.org/download/
# Install and run as service
net start mosquitto
```

### 2. Setup PostgreSQL Database

```sql
CREATE DATABASE fecs_db;
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure .env file
# Edit .env and update:
# - DATABASE_URL with your PostgreSQL credentials
# - SECRET_KEY with a secure random string

# Run database migrations
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will run on http://localhost:3000

### 5. Create Admin User

Use Python shell to create the first admin user:

```python
from app.database import SessionLocal
from app.models import User, UserRole
from app.services.auth_service import get_password_hash

db = SessionLocal()
admin = User(
    username="admin",
    password_hash=get_password_hash("admin123"),
    role=UserRole.ADMIN,
    email="admin@fecs.local",
    employee_id="EMP_ADMIN_001"
)
db.add(admin)
db.commit()
```

**Default Credentials:**
- Username: `admin` or Employee ID: `EMP_ADMIN_001`
- Password: `admin123`
- **Important**: Change the default password after first login

## Features

### Admin Features
- **User Management**: Create and manage operator accounts
- **Base Station View**: View devices grouped by base station
- **System Statistics**: Dashboard with key metrics
- **Full Alert Access**: View and manage all alerts across stations

### Operator Features
- **Card-Based Dashboard**: Intuitive navigation with Map & Alerts, Alert Logs, and Device Management
- **Device Registration**: Register user modules to personnel with names and phone numbers
- **Station-Based Filtering**: Only see devices and alerts from assigned station
- **Real-Time Map**: Live alert visualization with Leaflet maps
- **Alert Management**: Acknowledge and resolve alerts with notes

## Usage

### Login
- **Operators**: Login with Employee ID (e.g., EMP001) and password
- **Admins**: Login with username or employee ID and password
- Press Ctrl+1 to switch between Operator and Admin login modes

### For Operators
1. **View Alerts**: Real-time alerts appear on the map and list
2. **Register Devices**: Map unmapped devices to personnel
3. **Manage Alerts**: Acknowledge and resolve alerts
4. **Add Notes**: Add operational notes to any alert

### For Admins
1. **Create Users**: Add new operators with employee IDs and station assignments
2. **View Base Stations**: See all devices grouped by station
3. **Monitor System**: View statistics and system-wide alerts

## API Endpoints

### Authentication
- `POST /api/token` - Login (accepts employee_id or username)
- `GET /api/users/me` - Get current user info

### User Management (Admin Only)
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/next-employee-id` - Get next available employee ID
- `PATCH /api/users/{user_id}` - Update user (activate/deactivate)
- `GET /api/stats` - Get system statistics

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/{id}` - Get specific alert
- `PATCH /api/alerts/{id}/status` - Update alert status

### Device Registration
- `GET /api/device-registrations/unmapped` - Get unmapped devices
- `POST /api/device-registrations` - Register device
- `GET /api/device-registrations` - Get registered devices (filtered by station for operators)
- `PUT /api/device-registrations/{device_id}` - Update device registration
- `PATCH /api/device-registrations/{device_id}/deactivate` - Deactivate device

### Base Station Management (Admin Only)
- `GET /api/base-stations/devices` - Get devices grouped by station

### Real-Time
- `WS /ws` - WebSocket connection for real-time updates

## MQTT Topics

- `fecs/incoming` - Incoming alerts from base station (pipe-delimited format)
- `fecs/ack` - ACK messages to base station

## Alert Message Format

**Pipe-Delimited Format** (52 bytes):
```
test001|DEV_001|10.9347|78.1212|E|M|1705315800|1|A3F2
```

**Field Order**:
1. packet_id (unique identifier)
2. device_id (hardware device ID)
3. latitude (GPS coordinate)
4. longitude (GPS coordinate)
5. message_type: `E` (Emergency), `W` (Warning), `I` (Info)
6. signal_type: `M` (Manual), `A` (Automatic)
7. event_time (Unix timestamp)
8. source: `1` (Hardware), `0` (Software)
9. checksum (optional CRC16)

**Why Pipe-Delimited?**
- 70% smaller than JSON (~52 bytes vs ~180 bytes)
- Lower packet loss in weak signal areas
- Faster ESP32 processing (no JSON parsing)
- Better for LoRa/RF communication

## User Roles

### Admin
- Full system access
- User management (create, activate, deactivate operators)
- View all devices across all stations
- System statistics and monitoring
- Login with username or employee ID

### Operator
- Station-specific access
- Device registration for assigned station
- Alert management for station devices
- Real-time map and dashboard
- Must login with Employee ID (e.g., EMP001)

## Development Notes

- Backend runs on port 8000
- Frontend runs on port 3000
- MQTT broker runs on port 1883
- PostgreSQL runs on port 5432
- Backend uses virtual environment (venv)
- Station-based filtering implemented for operators
- Employee ID format: EMP001, EMP002, etc.

## Current Implementation

- Single base station deployment
- Centralized device registration
- Real-time alert monitoring
- Operator dashboard with card-based navigation
- Station-based access control

## Future Enhancements (Roadmap)

### Phase 2: Multi-Station Synchronization
**Problem**: Users moving between station coverage areas  
**Solution**: Mesh-based user registry synchronization  
**Benefits**:
- Seamless roaming support
- Offline inter-station communication
- Distributed fault tolerance

**Technical Approach**:
- LoRa mesh sync protocol (SYNC_USER, SYNC_ACK)
- Distributed database replication
- Last-Write-Wins conflict resolution
- Automatic retry with exponential backoff

**Timeline**: Phase 2 post-pilot deployment  
**Prerequisites**: Multi-station hardware deployment

## Testing

Send test alert via MQTT (pipe-delimited format):

```bash
mosquitto_pub -h localhost -t fecs/incoming -m "test001|DEV_001|10.9347|78.1212|E|M|1705315800|1|A3F2"
```

**Field Mapping**:
- `test001` - packet_id
- `DEV_001` - device_id
- `10.9347` - latitude
- `78.1212` - longitude
- `E` - Emergency (message_type)
- `M` - Manual (signal_type)
- `1705315800` - Unix timestamp
- `1` - Hardware source
- `A3F2` - Checksum (optional)
```

## License

Internal use only - Forest Department
