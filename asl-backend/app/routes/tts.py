from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from io import BytesIO
from gtts import gTTS

router = APIRouter()

class TTSRequest(BaseModel):
    text: str

@router.post("/api/speak")
async def speak(req: TTSRequest):
    tts = gTTS(text=req.text, lang="en")
    audio_data = BytesIO()
    tts.write_to_fp(audio_data)
    audio_data.seek(0)
    
    return StreamingResponse(audio_data, media_type="audio/mpeg")
