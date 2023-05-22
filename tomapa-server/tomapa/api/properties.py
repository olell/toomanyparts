from flask_restful import Resource

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load
from marshmallow import validate

from tomapa.api import load_schema_or_abort

from tomapa.models.parts import PartProperty
from tomapa.models.parts import PartProperty
from tomapa.models.parts import Unit
from tomapa.models.parts import Part
from tomapa.models.parts import PartCategory

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
    value_type = fields.String(
        required=True, validate=validate.OneOf(["float", "int", "str", "bool"])
    )

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


class PartPropertyPutSchema(Schema):
    id = fields.Integer(required=True)

    name = fields.String()
    display_name = fields.String()

    value = fields.String()
    value_type = fields.String(validate=validate.OneOf(["float", "int", "str", "bool"]))

    unit = fields.Integer()

    @post_load
    def update_property(self, data, **_):
        property = PartProperty.get_or_none(PartProperty.id == data["id"])
        if property is None:
            return

        new_name = data.get("name", None)
        if new_name is not None:
            property.name = new_name

        new_display_name = data.get("display_name", None)
        if new_display_name is not None:
            property.display_name = new_display_name

        new_value = data.get("value", None)
        new_value_type = data.get("value_type", None)
        if new_value is not None and new_value_type is not None:
            property.value = new_value
            property.value_type = new_value_type

        # Testing and converting value + type
        value = convert_value_and_type(property.value, property.value_type)
        if value is None:
            return None

        # Getting unit
        new_unit_id = data.get("unit", None)
        new_unit = None
        if new_unit_id is not None:
            new_unit = Unit.get_or_none(Unit.id == new_unit_id)
            if new_unit is None:
                return None

        if new_unit is not None:
            value, unit = get_base(value, unit)
            property.value = str(value)
            property.unit = unit

        property.save()
        return property


class PropertiesGetSchema(Schema):
    category = fields.Integer()


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

    def put(self):
        updated_property = load_schema_or_abort(PartPropertyPutSchema)
        return updated_property.as_dict(custom={"part": updated_property.part.id}), 200

    def delete(self):
        property = load_schema_or_abort(PartPropertyGetSchema)
        property.delete_instance()
        return {}, 204


def get_category_properties(category):
    result = set()
    for child in category.children:
        result.update(get_category_properties(child))

    for property in PartProperty.select():
        if property.part.category == category:
            result.add(property.name)

    return result


class PropertiesApi(Resource):
    def get(self):
        """Returns all unique property names"""
        filters = load_schema_or_abort(PropertiesGetSchema, "args")

        category_id = filters.get("category", None)
        result = set()
        if category_id is not None:
            category = PartCategory.get_or_none(PartCategory.id == category_id)
            if category is None:
                return {"message": "Unkown category"}, 404
            result.update(get_category_properties(category))

        else:
            for property in PartProperty.select().distinct():
                result.add(property.name)

        return {"properties": list(result)}, 200
