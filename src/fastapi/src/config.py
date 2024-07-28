from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # postgres envs
    PG_USER: str
    PG_PWD: str
    PG_HOSTNAME: str
    PG_PORT: int = 5432
    PG_DBNAME: str

    DEBUG: bool = True
    OPEN_API_URL: str = '/openapi.json'

    USER_TOKEN_LENGTH: int = 32
    USER_SESSION_EXPIRATION_DAYS: int = 14

    model_config = SettingsConfigDict(env_file='.env')

settings = Settings()  # type: ignore
