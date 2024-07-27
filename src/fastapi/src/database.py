from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncAttrs, AsyncSession

from .config import settings

#SQLALCHEMY_DATABASE_URL = 'sqlite:///./app.db'
SQLALCHEMY_DATABASE_URL = f'postgresql+asyncpg://{settings.PG_USER}:{settings.PG_PWD}@{settings.PG_HOSTNAME}:{settings.PG_PORT}/{settings.PG_DBNAME}'

engine = create_async_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, expire_on_commit=False, bind=engine)


class BaseModel(AsyncAttrs, DeclarativeBase):
    ...
