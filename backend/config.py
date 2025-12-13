from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/lender_match"
    
    class Config:
        env_file = ".env"

settings = Settings()
