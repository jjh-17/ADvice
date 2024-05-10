from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.text_ad_evaluation import text
from routers.text_info_evaluation import info

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(text)
app.include_router(info)
