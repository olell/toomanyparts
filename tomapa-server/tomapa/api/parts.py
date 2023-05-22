from flask_restful import Resource

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort

from tomapa.models.parts import Part
from tomapa.models.parts import PartCategory
from tomapa.models.parts import PartProperty
from tomapa.models.parts import Unit
from tomapa.models.storage import StorageLocation

from tomapa.util.units import get_base
from tomapa.util.helper import convert_value_and_type


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


class PartPropertyPostSchema(Schema):
    """
    Schema used to create a part property
    """

    name = fields.String(required=True)
    display_name = fields.String(required=True)

    value = fields.String(required=True)
    value_type = fields.String(required=True)

    unit = fields.Integer()

    @post_load
    def create_property(self, data, **_):
        # Getting unit
        unit_id = data.get("unit", None)
        unit = None
        if unit_id is not None:
            unit = Unit.get_or_none(Unit.id == unit_id)
            if unit is None:
                return None

        # Testing and converting value + type
        value = convert_value_and_type(data["value"], data["value_type"])
        if value is None:
            return None

        if unit is not None:
            value, unit = get_base(value, unit)

        new_property = PartProperty(
            name=data["name"],
            display_name=data["display_name"],
            value=str(value),
            value_type=data["value_type"],
            unit=unit,
        )
        return new_property


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

    def delete(self):
        part = load_schema_or_abort(PartGetSchema)

        for property in part.properties:
            property.delete_instance()

        part.delete_instance()

        return {}, 204
