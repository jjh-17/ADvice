from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    emotion_host: str
    text_ad_host: str
    text_image_host: str

    class Config:
        env_file = ".env"


settings = Settings()
