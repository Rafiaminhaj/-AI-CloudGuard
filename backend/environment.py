import random

class CloudIncidentEnv:

    def __init__(self):
        self.reset()

    def reset(self):
        self.state = {
            "cpu_usage": random.randint(10, 60),
            "status": "System Stable ✅"
        }
        return self.state

    def step(self, action):

        reward = 0
        done = False

        if action == "restart_server":
            self.state["status"] = "Service Restarted 🔄"
            reward = 2

        elif action == "scale_server":
            self.state["status"] = "Infrastructure Scaled ☁️"
            self.state["cpu_usage"] = max(10, self.state["cpu_usage"] - 20)
            reward = 3

        elif action == "ignore":
            self.state["status"] = "Ignored ⚠️"
            reward = 0

        else:
            self.state["status"] = "Unknown Action ❓"
            reward = -1

        # random CPU fluctuation (simulation)
        self.state["cpu_usage"] += random.randint(-5, 10)

        # CPU limit control
        self.state["cpu_usage"] = max(5, min(100, self.state["cpu_usage"]))

        return self.state, reward, done, {}