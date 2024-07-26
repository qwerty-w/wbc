from typing import Annotated, Generator
from fastapi import APIRouter, Depends
from sqlalchemy import select

from . import schema, models, crud
from ..models import User


router = APIRouter(prefix='/address')


def userid(userid: int):
    return userid


@router.get('/', response_model=list[schema.Address])
async def addresses(userid: Annotated[int, Depends(userid)]):
    return await crud.get_addresses(userid)


@router.post('/create')
def create_address():
    pass


@router.post('/import')
def import_address():
    pass
