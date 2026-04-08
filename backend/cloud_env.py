
import random

class CloudEnvironment:

    def __init__(self):
        self.cpu_usage = random.randint(10, 95)
        self.memory_usage = random.randint(20, 90)
        self.status = "Running"

    def get_state(self):

        return {
            "cpu": self.cpu_usage,
            "memory": self.memory_usage,
            "status": self.status
        }

    def simulate_incident(self):

        incidents = [
            "CPU Spike",
            "Memory Leak",
            "DDoS Attack",
            "Server Crash",
            "Slow Response"
        ]

        return random.choice(incidents)