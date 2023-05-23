from flask_restful import Resource

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort

from tomapa.models.storage import StorageLocation

###############################################################
#                         Schemata                            #
###############################################################


class StorageLocationGetSchema(Schema):
    id = fields.Integer(required=True)

    @post_load
    def get_storage_location(self, data, **_):
        return StorageLocation.get_or_none(StorageLocation.id == data["id"])


###############################################################
#                           Endpoints                         #
###############################################################


class StorageLocationApi(Resource):
    def get(self):
        location = load_schema_or_abort(StorageLocationGetSchema, "args")

        location_parts = [part.as_dict(["location"]) for part in location.parts]

        return location.as_dict(custom={"parts": location_parts})


class StorageLocationsApi(Resource):
    def get(self):
        return {"storage_locations": [x.as_dict() for x in StorageLocation.select()]}
