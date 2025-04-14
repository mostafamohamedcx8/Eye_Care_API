from flask import Flask, request, jsonify
# import threading
import concurrent.futures
import os

from models.quality_model import check_quality
from models.second_test import run_test
from models.parallel_model_1 import  run_model1
from models.parallel_model_2 import  run_model2
from models.parallel_model_3 import  run_model3


app = Flask(__name__)


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    image_path = data.get('imagePath')

    if not image_path or not os.path.exists(image_path):
        return jsonify({"error": "Invalid or missing image path"}), 400

    # Step 1: Quality Check
    is_ok, msg = check_quality(image_path)
    if not is_ok:
        return jsonify({"status": "rejected", "reason": msg})

    # Step 2: Test Model
    test_result = run_test(image_path)

    # Step 3: Parallel Models
    with concurrent.futures.ThreadPoolExecutor() as executor:
        f1 = executor.submit(run_model1, image_path)
        f2 = executor.submit(run_model2, image_path)
        f3 = executor.submit(run_model3, image_path)
    
        result1 = f1.result()
        result2 = f2.result()
        result3 = f3.result()
    result = {
        "status": "completed",
        "quality_check": msg,
        "test_model": test_result,
        "diseases": [
            {"name": result1["name"], "Probability": result1["probability"]},
            {"name": result2["name"], "Probability": result2["probability"]},
            {"name": result3["name"], "Probability": result3["probability"]}
        ],
        "report": "Image analyzed successfully"
    }
    return jsonify(result)



if __name__ == '__main__':
    print("run the app on local server")
    app.run(host='0.0.0.0', port=4000)
    print("after running")