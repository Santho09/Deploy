import subprocess

# List of API files to run
apis = [
    "diet_api.py",
    "medical_chatbot_api.py",
    "sleep_api.py",
    "workout_api.py",
    "workout_tracking_api.py"
                # add more api files here
]

processes = []

try:
    for api in apis:
        print(f"Starting {api}...")
        p = subprocess.Popen(["python", api])
        processes.append(p)

    # Keep the script running
    for p in processes:
        p.wait()

except KeyboardInterrupt:
    print("\nStopping all APIs...")
    for p in processes:
        p.terminate()
