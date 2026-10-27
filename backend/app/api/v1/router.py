from fastapi import APIRouter
from app.api.v1.routers.auth import router as auth_router
from app.api.v1.routers.users import router as users_router
from app.api.v1.routers.movements import router as movements_router
from app.api.v1.routers.purchases import router as purchases_router
from app.api.v1.routers.donations import router as donations_router
from app.api.v1.routers.expenses import router as expenses_router
from app.api.v1.routers.finance import router as finance_router
from app.api.v1.routers.reports import router as reports_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(movements_router)
api_v1_router.include_router(purchases_router)
api_v1_router.include_router(donations_router)
api_v1_router.include_router(expenses_router)
api_v1_router.include_router(finance_router)
api_v1_router.include_router(reports_router)
