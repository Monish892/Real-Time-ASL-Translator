import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.utils.frame_utils import decode_base64_frame
from app.services.mediapipe_service import extract_landmarks
from app.services.model_service import predict_sign

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/ws/translate")
async def websocket_translate(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            data_url = data.get("frame")
            if not data_url:
                continue
                
            try:
                rgb_frame = decode_base64_frame(data_url)
                flat_63_floats, list_dicts = extract_landmarks(rgb_frame)
                
                if flat_63_floats is None:
                    # No hand detected
                    await websocket.send_json({"letter": None})
                else:
                    label, confidence = predict_sign(flat_63_floats)
                    
                    if confidence >= 0.80:
                        await websocket.send_json({
                            "letter": label,
                            "confidence": confidence,
                            "landmarks": list_dicts
                        })
                    else:
                        # Hand detected but low confidence
                        await websocket.send_json({
                            "letter": None,
                            "confidence": confidence,
                            "landmarks": list_dicts
                        })
            except Exception as e:
                logger.error(f"Error processing frame: {e}")
                # Catch logging errors, send fallback response, and continue loop
                await websocket.send_json({"letter": None})
    except WebSocketDisconnect:
        logger.info("Client disconnected from /ws/translate")
