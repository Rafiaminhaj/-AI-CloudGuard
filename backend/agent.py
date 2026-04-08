from environment import CloudIncidentEnv

env = CloudIncidentEnv()

state = env.reset()

print("Initial State:", state)

actions = ["restart_server", "scale_server", "ignore"]

best_reward = -999
best_action = None

for action in actions:
    new_state, reward, done, _ = env.step(action)
    
    print("\nTesting Action:", action)
    print("State:", new_state)
    print("Reward:", reward)

    if reward > best_reward:
        best_reward = reward
        best_action = action

print("\nBest Action:", best_action)