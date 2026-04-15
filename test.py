import sys
import os

print(f"{sys.executable}")
if "anaconda" in sys.executable.lower() or "conda" in sys.executable.lower():
    print("Succes")
else:
    print("insucces") 