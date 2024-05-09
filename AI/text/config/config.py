from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ad_detection_model_path: str
    yolo_model_path: str
    pretrained_tokenizer: str

    class Config:
        env_file = ".env"


settings = Settings()
