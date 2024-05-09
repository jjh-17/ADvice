from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    fasttext_model_path: str
    yolo_model_path: str
    target_language_code: str
    google_application_credentials: str

    class Config:
        env_file = ".env"


settings = Settings()
