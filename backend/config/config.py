from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    emotion_host: str
    text_ad_host: str
    image_ad_host: str
    fasttext_model_path: str
    target_language_code: str
    ad_detection_model_path: str
    info_detection_model_path: str
    yolo_model_path: str
    pretrained_tokenizer: str
    user_agent: str

    class Config:
        env_file = ".env"


settings = Settings()
