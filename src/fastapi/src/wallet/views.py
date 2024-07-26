from typing import Annotated, Generator
from fastapi import APIRouter, Depends
from sqlalchemy import select


from ..models import User
from ..database import Session, SessionLocal
from . import schema, models


router = APIRouter(prefix='/address')


def userid(userid: int):
    return userid


def getdb() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@router.get('/', response_model=list[schema.Address])
def addresses(db: Annotated[Session, Depends(getdb)], userid: Annotated[int, Depends(userid)]):
    smt = select(models.UserBitcoinAddress).filter(models.UserBitcoinAddress.userid == userid)
    return db.scalars(smt)


@router.post('/create')
def create_address():
    pass


@router.post('/import')
def import_address():
    pass
