from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase

from .config import settings

#SQLALCHEMY_DATABASE_URL = 'sqlite:///./app.db'
SQLALCHEMY_DATABASE_URL = f'postgresql://{settings.PG_USER}:{settings.PG_PWD}@{settings.PG_URL}:{settings.PG_PORT}/{settings.PG_DBNAME}'

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class BaseModel(DeclarativeBase):
    ...
