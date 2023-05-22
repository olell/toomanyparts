from flask_restful import Resource

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort

from tomapa.models.parts import PartProperty
from tomapa.models.parts import PartProperty
from tomapa.models.parts import Unit
from tomapa.models.parts import Part

from tomapa.util.units import get_base
from tomapa.util.helper import convert_value_and_type

###############################################################
#                         Schemata                            #
###############################################################


class PartPropertyGetSchema(Schema):
    """
    Schema used to get a property
    """

    id = fields.Integer(required=True)

    @post_load
    def get_property(self, data, **_):
        return PartProperty.get_or_none(PartProperty.id == data["id"])


class PartPropertyPostSchema(Schema):
    """
    Schema used to create a part property
    """

    part = fields.Integer()

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

        part_id = data.get("part", None)
        part = None
        if part_id is not None:
            part = Part.get_or_none(Part.id == part_id)
            if part is None:
                return None

        new_property = PartProperty(
            part=part,
            name=data["name"],
            display_name=data["display_name"],
            value=str(value),
            value_type=data["value_type"],
            unit=unit,
        )
        return new_property


class PartPropertyPostSchemaRequiredPart(PartPropertyPostSchema):
    part = fields.Integer(required=True)


###############################################################
#                           Endpoints                         #
###############################################################


class PropertyApi(Resource):
    def get(self):
        property = load_schema_or_abort(PartPropertyGetSchema, "args")
        result = property.as_dict(custom={"part": property.part.id})

        return result, 200

    def post(self):
        new_property = load_schema_or_abort(PartPropertyPostSchemaRequiredPart)

        # Before saving to db check that the part doesn't already have a
        # property with the same name
        if (
            PartProperty.select()
            .where(
                (PartProperty.name == new_property.name)
                & (PartProperty.part == new_property.part)
            )
            .count()
            > 0
        ):
            return {"message": "the property is already assigned"}, 400
        new_property.save()

        return new_property.as_dict(custom={"part": new_property.part.id}), 200
