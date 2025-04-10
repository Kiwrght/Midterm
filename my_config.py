from pydantic_settings import BaseSettings, SettingsConfigDict


class MyConfig(BaseSettings):
    connection_string: str

    model_config = SettingsConfigDict(env_file="../.env")
