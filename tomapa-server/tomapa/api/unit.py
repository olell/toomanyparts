from flask_restful import Resource
from flask_restful import abort


from tomapa.models.parts import Unit

from tomapa.api import load_schema_or_abort

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load
from marshmallow import validates_schema
from marshmallow import ValidationError

from tomapa.util.units import get_unit_group


###############################################################
#                         Schemata                            #
###############################################################


class UnitGetSchema(Schema):
    id = fields.Integer()
    name = fields.String()

    @validates_schema
    def id_xor_name_required(self, data, **_):
        if not (("id" in data) ^ ("name" in data)):
            raise ValidationError("Either id or name is required (not both)")

    @post_load
    def get_unit(self, data, **_):
        unit_id = data.get("id", None)
        if unit_id is not None:
            return Unit.get_or_none(Unit.id == unit_id)
        name = data.get("name", None)
        if name is not None:
            return Unit.get_or_none(Unit.name == name)


###############################################################
#                           Endpoints                         #
###############################################################


class UnitApi(Resource):
    def get(self):
        unit = load_schema_or_abort(UnitGetSchema, "args")
        custom = {"group": [el.as_dict() for el in get_unit_group(unit)]}
        return unit.as_dict(custom=custom)


class UnitsApi(Resource):
    def get(self):
        return {"units": [lolwas.as_dict() for lolwas in Unit.select()]}
