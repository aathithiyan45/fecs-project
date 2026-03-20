import aiomqtt
from app.schemas import AckMessage, IncomingAlert
from app.config import settings
from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

async def publish_ack(alert: IncomingAlert, mqtt_client: aiomqtt.Client):
    """Publish ACK message to MQTT broker"""
    ack = AckMessage(
        device_id=alert.device_id,
        for_packet_id=alert.packet_id,
        timestamp=datetime.utcnow()
    )
    
    try:
        await mqtt_client.publish(
            settings.MQTT_ACK_TOPIC,
            payload=json.dumps(ack.model_dump(), default=str)
        )
        logger.info(f"ACK published for packet_id: {alert.packet_id}")
    except Exception as e:
        logger.error(f"Failed to publish ACK: {e}")
