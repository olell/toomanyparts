"""
Too Many Parts Server
"""


from flask import Flask
import os


app = Flask(__name__)
app.config.from_pyfile("config.py")

with app.app_context():
    # Init database in app context
    from tomapa.models import Database

    Database()
