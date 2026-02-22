from fastapi import FastAPI
from app.routers import users
from app.database import engine, Base

app = FastAPI()

# Create tables when the app starts
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "GroupsApp backend running"}