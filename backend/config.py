from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_host: str
    db_port: int = 5433
    db_name: str
    db_user: str
    db_password: str
    # Stored as a comma-separated string; split into a list via the cors_origins_list property
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", populate_by_name=True)

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]


settings = Settings()
