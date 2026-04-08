tasks = {

    "easy": {
        "description": "Reduce CPU usage below 60",

        "initial_state": {
            "cpu_usage": 80,
            "memory_usage": 70,
            "status": "incident"
        }
    },

    "medium": {
        "description": "Recover system from incident state",

        "initial_state": {
            "cpu_usage": 75,
            "memory_usage": 65,
            "status": "incident"
        }
    },

    "hard": {
        "description": "Recover system and reduce CPU below 40",

        "initial_state": {
            "cpu_usage": 90,
            "memory_usage": 80,
            "status": "incident"
        }
    }

}