from flask_restful import Resource

from tomapa.api import load_schema_or_abort
from tomapa.util.sources.lcsc import get_lcsc_data
from tomapa.util.sources.mouser import get_mouser_data

from marshmallow import Schema, fields


###############################################################
#                         Schemata                            #
###############################################################


class SourceGetSchema(Schema):
    """
    Schema used for the get-request of the categories endpoint
    """

    src = fields.String(required=True)
    src_no = fields.String(required=True)


###############################################################
#                           Endpoints                         #
###############################################################


class SourceApi(Resource):
    def get(self):
        data = load_schema_or_abort(SourceGetSchema, "args")

        if data["src"].lower() == "lcsc":
            part_data = get_lcsc_data(data["src_no"])
            if part_data is not None:
                return part_data, 200
        if data["src"].lower() == "mouser":
            part_data = get_mouser_data(data["src_no"])
            if part_data is not None:
                return part_data, 200
        return {"message": "Not found!"}, 404
