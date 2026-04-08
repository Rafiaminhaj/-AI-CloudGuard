# AI CloudGuard

AI CloudGuard is a Reinforcement Learning environment designed to simulate cloud incident management.

## Problem

Cloud servers often face incidents like high CPU usage or service failures.  
This environment allows AI agents to learn how to respond to such incidents automatically.

## Actions

- restart_server
- scale_server
- ignore

## Tasks

Easy → Reduce CPU usage below 60  
Medium → Recover system from incident  
Hard → Recover system and reduce CPU below 40

## How to Run

Start backend:

python backend/app.py

Run inference:

python backend/inference.py
