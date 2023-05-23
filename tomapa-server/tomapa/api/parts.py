from flask_restful import Resource

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort

from tomapa.models.parts import Part
from tomapa.models.parts import PartCategory
from tomapa.models.storage import StorageLocation

from tomapa.api.properties import PartPropertyPostSchema


###############################################################
#                         Schemata                            #
###############################################################
class PartGetSchema(Schema):
    """
    Schema used to get a part
    """

    id = fields.Integer(required=True)

    @post_load
    def get_part(self, data, **_):
        return Part.get_or_none(Part.id == data["id"])


class PartPostSchema(Schema):
    """
    Schema used to create a part. Creates a Part model and saves
    it to db!
    """

    stock = fields.Integer(default=0)
    category = fields.Integer(required=True)
    description = fields.String(required=True)
    location = fields.Integer(required=True)

    properties = fields.List(fields.Nested(PartPropertyPostSchema))

    @post_load
    def create_part(self, data, **_):
        category = PartCategory.get_or_none(PartCategory.id == data["category"])
        location = StorageLocation.get_or_none(StorageLocation.id == data["location"])
        if category is None or location is None:
            return None

        new_part = Part(
            stock=data.get("stock", 0),
            category=category,
            description=data["description"],
            location=location,
        )

        new_part.save(1)

        for property in data.get("properties", []):
            property.part = new_part
            property.save(1)

        return new_part


class PartPutSchema(Schema):
    """
    Schema used to update an existing part and its properties
    """

    id = fields.Integer(required=True)
    stock = fields.Integer()
    category = fields.Integer()
    description = fields.String()
    location = fields.Integer()

    @post_load
    def update_part(self, data, **_):
        part = Part.get_or_none(Part.id == data["id"])
        if part is None:
            return None

        new_stock = data.get("stock", None)
        if new_stock is not None:
            part.stock = new_stock

        new_category_id = data.get("category", None)
        if new_category_id is not None:
            new_category = PartCategory.get_or_none(PartCategory.id == new_category_id)
            if new_category is None:
                return None
            part.category = new_category

        new_description = data.get("description", None)
        if new_description is not None:
            part.description = new_description

        new_location_id = data.get("location", None)
        if new_location_id is not None:
            new_location = StorageLocation.get_or_none(
                StorageLocation.id == new_location_id
            )
            if new_location is None:
                return None
            part.location = new_location

        part.save()
        return part


###############################################################
#                           Endpoints                         #
###############################################################


class PartApi(Resource):
    def get(self):
        part = load_schema_or_abort(PartGetSchema, "args")
        return part.as_dict(), 200

    def post(self):
        new_part = load_schema_or_abort(PartPostSchema)
        return new_part.as_dict(), 200

    def put(self):
        updated_part = load_schema_or_abort(PartPutSchema)
        return updated_part.as_dict(), 200

    def delete(self):
        part = load_schema_or_abort(PartGetSchema)

        for property in part.properties:
            property.delete_instance()

        part.delete_instance()

        return {}, 204


class PartsApi(Resource):
    def get(self):
        parts = []
        for part in Part.select():
            parts.append(part.as_dict())
        return {"parts": parts}
