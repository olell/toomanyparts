from flask_restful import Resource

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort

from tomapa.models.parts import PartProperty

###############################################################
#                         Schemata                            #
###############################################################


class PropertyGetSchema(Schema):
    """
    Schema used to get a property
    """

    id = fields.Integer(required=True)

    @post_load
    def get_property(self, data, **_):
        return PartProperty.get_or_none(PartProperty.id == data["id"])


###############################################################
#                           Endpoints                         #
###############################################################


class PropertyApi(Resource):
    def get(self):
        property = load_schema_or_abort(PropertyGetSchema, "args")
        result = property.as_dict(custom={"part": property.part.id})

        return result, 200
