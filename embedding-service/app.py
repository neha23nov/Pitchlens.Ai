from sentence_transformers import SentenceTransformer
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

model = SentenceTransformer("all-MiniLM-L6-v2")

app = Flask(__name__)
CORS(app)

@app.route("/embed", methods=["POST"])
def embed():
    data = request.json
    text = data.get("text", "")
    vector = model.encode(text).tolist()
    return jsonify({"vector": vector})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
