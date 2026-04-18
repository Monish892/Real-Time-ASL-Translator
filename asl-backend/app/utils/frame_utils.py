import base64
import cv2
import numpy as np

def decode_base64_frame(data_url: str) -> np.ndarray:
    """
    Decodes a base64 encoded image string to a numpy array (H, W, 3) in RGB.
    """
    # Strip the "data:image/jpeg;base64," prefix if present
    if "," in data_url:
        data_url = data_url.split(",")[1]
        
    encoded_data = base64.b64decode(data_url)
    np_arr = np.frombuffer(encoded_data, np.uint8)
    bgr_img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    
    if bgr_img is None:
        raise ValueError("Could not decode image.")
        
    rgb_img = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    return rgb_img
