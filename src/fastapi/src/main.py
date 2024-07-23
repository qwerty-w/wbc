import fastapi
from .config import settings
from .database import engine, BaseModel


app = fastapi.FastAPI(
    debug=settings.DEBUG,
    openapi_url=settings.OPEN_API_URL if not settings.DEBUG else None
)
