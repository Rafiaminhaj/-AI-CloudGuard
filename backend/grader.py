def grade_task(state):

    score = 0

    if state["status"] == "recovering":
        score += 0.5

    if state["cpu_usage"] < 60:
        score += 0.5

    return score