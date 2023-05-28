"""
Too Many Parts Server
"""


from flask import Flask
from flask_restful import Api
from flask_cors import CORS

from logging.config import dictConfig

# Creating flask app
app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

app.config.from_pyfile("config.py")

flask_api = Api(app)

# Configuring logger
dictConfig(
    {
        "version": 1,
        "formatters": {
            "default": {
                "format": "[%(asctime)s] %(levelname)s: %(message)s",
            }
        },
        "handlers": {
            "wsgi": {
                "class": "logging.StreamHandler",
                "stream": "ext://flask.logging.wsgi_errors_stream",
                "formatter": "default",
            }
        },
        "root": {"level": app.config.get("LOGGING_LEVEL"), "handlers": ["wsgi"]},
    }
)


with app.app_context():
    # Init database in app context
    from tomapa.models import Database

    Database()

    # Fill database with default content (if not already filled)
    from tomapa.models.content import create_content

    create_content()

# API Resources
from tomapa.api.categories import CategoriesApi
from tomapa.api.categories import CategoryApi
from tomapa.api.parts import PartApi
from tomapa.api.parts import PartsApi
from tomapa.api.properties import PropertyApi
from tomapa.api.properties import PropertiesApi
from tomapa.api.properties import PropertyTemplatesApi
from tomapa.api.storage import StorageLocationApi
from tomapa.api.storage import StorageLocationsApi
from tomapa.api.unit import UnitApi
from tomapa.api.unit import UnitsApi
from tomapa.api.docs import DocumentApi
from tomapa.api.sources import SourceApi

flask_api.add_resource(CategoriesApi, "/categories")
flask_api.add_resource(CategoryApi, "/category")
flask_api.add_resource(PartApi, "/part")
flask_api.add_resource(PartsApi, "/parts")
flask_api.add_resource(PropertyApi, "/part/property")
flask_api.add_resource(PropertiesApi, "/properties")
flask_api.add_resource(PropertyTemplatesApi, "/properties/templates")
flask_api.add_resource(StorageLocationApi, "/storelocation")
flask_api.add_resource(StorageLocationsApi, "/storelocations")
flask_api.add_resource(UnitApi, "/unit")
flask_api.add_resource(UnitsApi, "/units")
flask_api.add_resource(DocumentApi, "/doc")
flask_api.add_resource(SourceApi, "/source")

app.logger.info("Hey there!")
