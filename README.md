## RealScreen Web UI

A simple Flask UI for comparing screen sizes using `realscreenPy`.
It renders two screens side-by-side at a fixed 10-inch diagonal and lets you change the aspect ratios.
The visualization scales to fit the browser window while preserving relative sizes.

### Requirements
- Python 3.9+
- Flask
- realscreenPy (must be importable in your environment)

### Setup

# Install Flask and realScreenPy
pip install Flask realScreenPy
```

### Run
```bash
python app.py
``

### Use
- Enter aspect ratios such as `16:9`, `4:3`, or `21:9` for Screen 1 and Screen 2.
- Rectangles scale to fit within the viewport and maintain relative sizing.

### API
`POST /api/calc`

Body (JSON):
```json
{ "aspect_ratio": "16:9" }
```
Optional: you may provide `diagonal` (defaults to 10).

Response (JSON):
```json
{ "width": 8.73, "height": 4.91, "area": 42.87 }
```

### Project Structure
- `app.py`: Flask app and JSON API
- `templates/index.html`: UI markup
- `static/css/main.css`: styles
- `static/js/main.js`: client-side logic
