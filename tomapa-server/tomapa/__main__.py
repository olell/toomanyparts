"""
Too Many Parts Server
"""

from tomapa import app

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3279, debug=True, use_reloader=False)
