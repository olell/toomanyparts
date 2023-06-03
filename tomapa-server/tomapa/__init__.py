"""
Too Many Parts Server
"""


from flask import Flask
from flask_restful import Api
from flask_cors import CORS

from flask import send_from_directory

from logging.config import dictConfig

# Creating flask app
app = Flask(__name__, static_url_path="", static_folder="static/frontend")
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
from tomapa.api.docs import DocsApi
from tomapa.api.docs import LabelApi
from tomapa.api.sources import SourceApi
from tomapa.api.search import SearchApi
from tomapa.api.bom import BOMsApi
from tomapa.api.bom import BOMApi
from tomapa.api.bom import BOMImageApi

flask_api.add_resource(CategoriesApi, "/api/categories")
flask_api.add_resource(CategoryApi, "/api/category")
flask_api.add_resource(PartApi, "/api/part")
flask_api.add_resource(PartsApi, "/api/parts")
flask_api.add_resource(PropertyApi, "/api/part/property")
flask_api.add_resource(PropertiesApi, "/api/properties")
flask_api.add_resource(PropertyTemplatesApi, "/api/properties/templates")
flask_api.add_resource(StorageLocationApi, "/api/storelocation")
flask_api.add_resource(StorageLocationsApi, "/api/storelocations")
flask_api.add_resource(UnitApi, "/api/unit")
flask_api.add_resource(UnitsApi, "/api/units")
flask_api.add_resource(DocumentApi, "/api/doc")
flask_api.add_resource(DocsApi, "/api/docs")
flask_api.add_resource(LabelApi, "/api/label")
flask_api.add_resource(SourceApi, "/api/source")
flask_api.add_resource(SearchApi, "/api/search")
flask_api.add_resource(BOMsApi, "/api/boms")
flask_api.add_resource(BOMApi, "/api/bom")
flask_api.add_resource(BOMImageApi, "/api/bom/image")

app.logger.info("Hey there!")


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")
