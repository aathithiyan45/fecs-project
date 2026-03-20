import asyncio
import aiomqtt
import json
import logging
from app.config import settings
from app.schemas import IncomingAlert
from app.database import SessionLocal
from app.services.alert_service import is_duplicate, store_alert, should_send_ack
from app.services.ack_service import publish_ack

logger = logging.getLogger(__name__)

class MQTTHandler:
    def __init__(self):
        self.client = None
        self.websocket_manager = None
    
    def set_websocket_manager(self, manager):
        self.websocket_manager = manager
    
    async def process_incoming_alert(self, message: str):
        """Process incoming alert from MQTT"""
        try:
            # Parse pipe-delimited format: packet_id|device_id|lat|lon|msg_type|sig_type|timestamp|source|checksum
            parts = message.strip().split('|')
            
            if len(parts) < 8:
                logger.error(f"Invalid message format: {message}")
                return
            
            # Map single-char codes to full values
            msg_type_map = {'E': 'emergency', 'W': 'warning', 'I': 'info'}
            sig_type_map = {'M': 'manual', 'A': 'automatic'}
            source_map = {'1': 'hardware', '0': 'software'}
            
            data = {
                'packet_id': parts[0],
                'device_id': parts[1],
                'latitude': float(parts[2]),
                'longitude': float(parts[3]),
                'message_type': msg_type_map.get(parts[4], 'emergency'),
                'signal_type': sig_type_map.get(parts[5], 'manual'),
                'event_time': parts[6],  # Unix timestamp
                'source': source_map.get(parts[7], 'hardware')
            }
            
            alert = IncomingAlert(**data)
            
            db = SessionLocal()
            try:
                # Check for duplicate
                if is_duplicate(db, alert):
                    logger.info(f"Duplicate alert discarded: {alert.packet_id}")
                    return
                
                # Store alert
                stored_alert = store_alert(db, alert)
                logger.info(f"Alert stored: {stored_alert.id}")
                
                # Send ACK if needed
                if should_send_ack(alert) and self.client:
                    await publish_ack(alert, self.client)
                
                # Push to WebSocket clients
                if self.websocket_manager:
                    await self.websocket_manager.broadcast(json.dumps({
                        "type": "new_alert",
                        "data": {
                            "id": stored_alert.id,
                            "packet_id": stored_alert.packet_id,
                            "device_id": stored_alert.device_id,
                            "latitude": stored_alert.latitude,
                            "longitude": stored_alert.longitude,
                            "message_type": stored_alert.message_type.value,
                            "signal_type": stored_alert.signal_type.value,
                            "event_time": stored_alert.event_time.isoformat(),
                            "received_at": stored_alert.received_at.isoformat(),
                            "status": stored_alert.status.value,
                            "source": stored_alert.source
                        }
                    }))
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error processing alert: {e}")
    
    async def start(self):
        """Start MQTT subscriber"""
        while True:
            try:
                async with aiomqtt.Client(
                    hostname=settings.MQTT_BROKER_HOST,
                    port=settings.MQTT_BROKER_PORT
                ) as client:
                    self.client = client
                    await client.subscribe(settings.MQTT_INCOMING_TOPIC)
                    logger.info(f"Subscribed to {settings.MQTT_INCOMING_TOPIC}")
                    
                    async for message in client.messages:
                        await self.process_incoming_alert(message.payload.decode())
                        
            except aiomqtt.MqttError as e:
                logger.error(f"MQTT connection error: {e}. Reconnecting in 5 seconds...")
                await asyncio.sleep(5)

mqtt_handler = MQTTHandler()
