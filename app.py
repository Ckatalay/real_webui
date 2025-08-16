from flask import Flask, render_template, request, jsonify
from realscreenPy import Real


def calculate_screen(diagonal_inches, aspect_ratio_str):
    real = Real(float(diagonal_inches), aspect_ratio_str)
    dims = real.get_dimensions()
    width_in = dims["width"]
    height_in = dims["height"]
    return width_in, height_in


app = Flask(__name__)


@app.route('/', methods=['GET', 'POST'])
def index():
    # Screen 1
    diagonal1 = request.form.get('diagonal1') if request.method == 'POST' else None
    aspect_ratio1 = request.form.get('aspect_ratio1') if request.method == 'POST' else None

    if not diagonal1:
        diagonal1 = 10
    if not aspect_ratio1:
        aspect_ratio1 = "16:9"

    width_in_1, height_in_1 = calculate_screen(diagonal1, aspect_ratio1)

    # Screen 2
    diagonal2 = request.form.get('diagonal2') if request.method == 'POST' else None
    aspect_ratio2 = request.form.get('aspect_ratio2') if request.method == 'POST' else None

    if not diagonal2:
        diagonal2 = 5
    if not aspect_ratio2:
        aspect_ratio2 = "16:9"

    width_in_2, height_in_2 = calculate_screen(diagonal2, aspect_ratio2)

    return render_template(
        "index.html",
        screen1=(width_in_1, height_in_1),
        diagonal1=diagonal1,
        aspect_ratio1=aspect_ratio1,
        screen2=(width_in_2, height_in_2),
        diagonal2=diagonal2,
        aspect_ratio2=aspect_ratio2,
    )


@app.route('/api/calc', methods=['POST'])
def api_calc():
    data = request.get_json(silent=True) or {}
    diagonal = data.get('diagonal')
    aspect_ratio = data.get('aspect_ratio')

    if diagonal is None or aspect_ratio is None:
        return jsonify({"error": "Missing 'diagonal' or 'aspect_ratio'"}), 400

    try:
        width_in, height_in = calculate_screen(diagonal, aspect_ratio)
        area_in2 = width_in * height_in
        return jsonify({
            "width": width_in,
            "height": height_in,
            "area": area_in2,
        })
    except Exception as exc:
        return jsonify({"error": str(exc)}), 400


if __name__ == '__main__':
    app.run(debug=True)