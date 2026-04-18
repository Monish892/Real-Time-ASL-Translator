from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import websocket, tts

app = FastAPI(title="ASL Translator Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket.router)
app.include_router(tts.router)

@app.get("/")
def health_check():
    return {"status": "ok"}
