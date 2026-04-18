# ASL Translator Backend

Built with FastAPI, MediaPipe, and TensorFlow.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *Note: TensorFlow and MediaPipe require Python 3.9–3.11 (NOT 3.12+).*

2. Add your trained model:
   Place your trained model file `asl_model.h5` inside the `model/` directory.
   Expected path: `model/asl_model.h5`

3. Run the server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend will be available at `http://localhost:8000` and `ws://localhost:8000`.
