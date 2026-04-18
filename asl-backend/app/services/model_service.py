import json
import logging
import os
import numpy as np
from typing import Tuple, Optional, List

# Suppress verbose TensorFlow logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

model = None
LABELS = {}
logger = logging.getLogger(__name__)

# Assuming the server is run from the `asl-backend` directory
MODEL_PATH = "model/asl_model.h5"
LABELS_PATH = "model/labels.json"

def init_service():
    global model, LABELS
    
    try:
        if os.path.exists(LABELS_PATH):
            with open(LABELS_PATH, "r") as f:
                LABELS = json.load(f)
    except Exception as e:
        logger.error(f"Error loading labels: {e}")
        
    try:
        from tensorflow.keras.models import load_model
        if os.path.exists(MODEL_PATH):
            print(f"DEBUG: Found model at {os.path.abspath(MODEL_PATH)}")
            model = load_model(MODEL_PATH)
            print("DEBUG: Model loaded successfully!")
        else:
            print(f"DEBUG: Model NOT found at {os.path.abspath(MODEL_PATH)}")
            print("Warning: Add your trained model to model/asl_model.h5")
    except ImportError:
        print("Warning: Add your trained model to model/asl_model.h5")
        logger.warning("Tensorflow not installed properly.")
    except Exception as e:
        print("Warning: Add your trained model to model/asl_model.h5")
        logger.error(f"Error loading model: {e}")

# Initialize when module is loaded
init_service()

def predict_sign(landmarks_63: List[float]) -> Tuple[Optional[str], float]:
    if model is not None:
        try:
            # Reshape to (1, 63)
            input_data = np.array(landmarks_63).reshape(1, 63)
            # Run prediction
            predictions = model.predict(input_data, verbose=0)
            class_idx = np.argmax(predictions[0])
            confidence = float(predictions[0][class_idx])
            label = LABELS.get(str(class_idx), None)
            return label, confidence
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            
    # Heuristic fallback (Landmarks: 21 points * 3 = 63 values)
    try:
        # Reshape to (21, 3)
        pts = np.array(landmarks_63).reshape(21, 3)
        
        def is_open(tip_idx, mcp_idx):
            # Distance from wrist (0) to tip vs wrist to MCP
            dist_tip = np.linalg.norm(pts[tip_idx] - pts[0])
            dist_mcp = np.linalg.norm(pts[mcp_idx] - pts[0])
            return dist_tip > dist_mcp * 1.2
            
        index_open = is_open(8, 5)
        middle_open = is_open(12, 9)
        ring_open = is_open(16, 13)
        pinky_open = is_open(20, 17)
        # Thumb is tricky, use distance to index MCP
        thumb_open = np.linalg.norm(pts[4] - pts[5]) > np.linalg.norm(pts[3] - pts[5]) * 1.2
        
        # A: All closed
        if not any([index_open, middle_open, ring_open, pinky_open]):
            return "A", 0.90
        # B: All open
        if all([index_open, middle_open, ring_open, pinky_open]):
            return "B", 0.90
        # L: Thumb and Index open
        if thumb_open and index_open and not any([middle_open, ring_open, pinky_open]):
            return "L", 0.95
        # V: Index and Middle open
        if index_open and middle_open and not any([ring_open, pinky_open]):
            return "V", 0.95
        # W: Index, Middle, Ring open
        if index_open and middle_open and ring_open and not pinky_open:
            return "W", 0.95
        # Y: Thumb and Pinky open
        if thumb_open and pinky_open and not any([index_open, middle_open, ring_open]):
            return "Y", 0.95
            
        return "HAND", 0.50
    except Exception as e:
        logger.error(f"Heuristic error: {e}")
        return None, 0.0
