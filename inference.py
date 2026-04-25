from backend.environment import CloudIncidentEnv

env = CloudIncidentEnv()

print("🛡️ AI CloudGuard")
print("Smart AI System for Cloud Incident Response\n")

state = env.reset()

step_count = 0

while True:

    print("\nChoose Action:\n")
    print("1 → Restart Service")
    print("2 → Scale Infrastructure")
    print("3 → Ignore\n")

    action_input = input("Enter Action: ")

    action_map = {
        "1": "restart_server",
        "2": "scale_server",
        "3": "ignore"
    }

    action = action_map.get(action_input, "ignore")

    new_state, reward, done, _ = env.step(action)

    step_count += 1

    print(f"[STEP {step_count}]")
    print("State:", new_state)
    print("Reward:", reward)
    print("Done:", done)

    if done:
        print("\n[END] Incident Resolved")
        break
