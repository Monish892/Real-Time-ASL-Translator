import mediapipe as mp
from typing import Optional, List, Tuple, Dict

# Initialize ONCE at module level
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.7
)

def extract_landmarks(rgb_frame) -> Tuple[Optional[List[float]], Optional[List[Dict[str, float]]]]:
    """
    Returns (flat_63_floats_for_model, list_of_{x,y}_dicts_for_overlay)
    If no hand is detected, returns (None, None).
    """
    results = hands.process(rgb_frame)
    if not results.multi_hand_landmarks:
        return None, None
        
    hand_landmarks = results.multi_hand_landmarks[0]
    
    flat_63_floats = []
    list_of_dicts = []
    
    for landmark in hand_landmarks.landmark:
        flat_63_floats.extend([landmark.x, landmark.y, landmark.z])
        list_of_dicts.append({"x": landmark.x, "y": landmark.y})
        
    return flat_63_floats, list_of_dicts
