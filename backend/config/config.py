from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    openai_api_key: str
    emotion_host: str

    class Config:
        env_file = ".env"


settings = Settings()
