from flask_restful import Resource
from flask_restful import abort

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


class StorageLocationPostSchema(Schema):
    name = fields.String(required=True)

    @post_load
    def create_storage_location(self, data, **_):
        new_storage_location = StorageLocation(name=data["name"])
        return new_storage_location


###############################################################
#                           Endpoints                         #
###############################################################


class StorageLocationApi(Resource):
    def get(self):
        location = load_schema_or_abort(StorageLocationGetSchema, "args")

        location_parts = [part.as_dict(["location"]) for part in location.parts]

        return location.as_dict(custom={"parts": location_parts})

    def post(self):
        new_location = load_schema_or_abort(StorageLocationPostSchema)

        location_with_same_name = StorageLocation.get_or_none(
            StorageLocation.name == new_location.name
        )
        if location_with_same_name is not None:
            abort(409, message="Location name already in use")

        new_location.save()
        return new_location.as_dict(), 200

    def delete(self):
        location = load_schema_or_abort(StorageLocationGetSchema)

        if StorageLocation.select().count() <= 1:
            abort(406, message="Cannot delete last storage location")

        fallback_location = (
            StorageLocation.select()
            .where(StorageLocation.id != location.id)
            .order_by(StorageLocation.id)
            .limit(1)
            .objects()[0]
        )

        for part in location.parts:
            part.location = fallback_location
            part.save()

        location.delete_instance()
        return {}, 204


class StorageLocationsApi(Resource):
    def get(self):
        return {"storage_locations": [x.as_dict() for x in StorageLocation.select()]}
