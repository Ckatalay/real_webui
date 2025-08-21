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
    # Fixed diagonal for both screens
    fixed_diagonal = 10

    # Screen 1
    aspect_ratio1 = request.form.get('aspect_ratio1') if request.method == 'POST' else None
    if not aspect_ratio1:
        aspect_ratio1 = "16:9"
    width_in_1, height_in_1 = calculate_screen(fixed_diagonal, aspect_ratio1)

    # Screen 2
    aspect_ratio2 = request.form.get('aspect_ratio2') if request.method == 'POST' else None
    if not aspect_ratio2:
        aspect_ratio2 = "18:9"
    width_in_2, height_in_2 = calculate_screen(fixed_diagonal, aspect_ratio2)

    return render_template(
        "index.html",
        screen1=(width_in_1, height_in_1),
        aspect_ratio1=aspect_ratio1,
        screen2=(width_in_2, height_in_2),
        aspect_ratio2=aspect_ratio2,
        fixed_diagonal=fixed_diagonal,
    )


@app.route('/api/calc', methods=['POST'])
def api_calc():
    data = request.get_json(silent=True) or {}
    aspect_ratio = data.get('aspect_ratio')
    diagonal = data.get('diagonal', 10)  # default to 10 inches if not provided

    if aspect_ratio is None:
        return jsonify({"error": "Missing 'aspect_ratio'"}), 400

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