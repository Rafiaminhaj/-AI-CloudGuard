from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from environment import CloudIncidentEnv
from rag_engine import rag_query

app = Flask(__name__)
CORS(app)

env = CloudIncidentEnv()

@app.route('/rag-query', methods=['POST'])
def handle_rag_query():
    data = request.json
    query = data.get('query', '')
    response = rag_query(query)
    return jsonify({"response": response})

# Frontend dashboard show karega
@app.route("/")
def home():
    return send_file("../frontend/index.html")


# Reset environment
@app.route("/reset", methods=["GET","POST"])
def reset():
    state = env.reset()
    return jsonify(state)


# Action step
@app.route("/step", methods=["POST"])
def step():
    data = request.get_json()
    action = data.get("action")

    state, reward, done, info = env.step(action)

    return jsonify({
        "state": state,
        "reward": reward,
        "done": done
    })


# Current state
@app.route("/state", methods=["GET"])
def state():
    return jsonify(env.state)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7860)
