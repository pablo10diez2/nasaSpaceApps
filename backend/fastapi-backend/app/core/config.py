from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "FastAPI Backend"
    admin_email: str = "admin@example.com"
    items_per_page: int = 50

    class Config:
        env_file = ".env"

settings = Settings()