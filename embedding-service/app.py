from sentence_transformers import SentenceTransformer
from flask import Flask, request, jsonify

model = SentenceTransformer("all-MiniLM-L6-v2")

app = Flask(__name__)

@app.route("/embed", methods=["POST"])
def embed():
    data = request.json
    text = data.get("text", "")
    vector = model.encode(text).tolist()
    return jsonify({"vector": vector})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
    