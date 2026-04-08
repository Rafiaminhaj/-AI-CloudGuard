from backend.environment import CloudIncidentEnv

env = CloudIncidentEnv()

print("🛡️ AI CloudGuard")
print("Smart AI System for Cloud Incident Response\n")

state = env.reset()

while True:

    print("\nEnter Action (1-5)\n")
    print("1 → Check System Health")
    print("2 → Restart Service")
    print("3 → Scale Infrastructure")
    print("4 → Block Attack")
    print("5 → Ignore\n")

    action_input = input("Enter Action: ")

    action_map = {
        "1": "check_health",
        "2": "restart_server",
        "3": "scale_server",
        "4": "block_attack",
        "5": "ignore"
    }

    action = action_map.get(action_input, "ignore")

    new_state, reward, done, _ = env.step(action)

    print("\nState:", new_state, "| Reward:", reward, "| Done:", done)

    if done:
        print("\n✅ Incident Resolved")
        break