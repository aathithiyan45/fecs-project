from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # MQTT
    MQTT_BROKER_HOST: str
    MQTT_BROKER_PORT: int
    MQTT_INCOMING_TOPIC: str
    MQTT_ACK_TOPIC: str
    
    # JWT
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Application
    DUPLICATE_TIME_THRESHOLD_SECONDS: int
    DUPLICATE_DISTANCE_THRESHOLD_METERS: int
    
    class Config:
        env_file = ".env"

settings = Settings()
