from flask import Flask, request, jsonify, send_file
from environment import CloudIncidentEnv

app = Flask(__name__)

env = CloudIncidentEnv()


# Frontend dashboard show karega
@app.route("/")
def home():
    return send_file("../frontend/index.html")


# Reset environment
@app.route("/reset", methods=["GET"])
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