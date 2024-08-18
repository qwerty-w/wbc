import fastapi
from .config import settings
from .database import engine, BaseModel

from .auth.views import router as auth_router
from .wallet.views import router as wallet_router
from .explorer.views import router as explorer_router


app = fastapi.FastAPI(
    root_path='/api',
    debug=settings.DEBUG,
    openapi_url=settings.OPEN_API_URL if settings.DEBUG else None,
)
app.include_router(wallet_router)
app.include_router(auth_router)
app.include_router(explorer_router)
