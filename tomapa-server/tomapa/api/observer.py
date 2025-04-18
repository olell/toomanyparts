from flask_restful import Resource
from flask_restful import abort

from flask import request

from tomapa.models.observer import ObservedPart
from tomapa.models.observer import Observation

from tomapa.api import load_schema_or_abort

from tomapa.util.observer import do_single_observation

from marshmallow import Schema, fields, post_load


###############################################################
#                         Schemata                            #
###############################################################

class ObservedPartPostSchema(Schema):
    """
    Schema used to create a new ObservedPart model
    """

    source = fields.String(required=True)
    part_code = fields.String(required=True)

    @post_load
    def create_observed_part(self, data, **_):
        if not data["source"] in ["lcsc", "mouser"]:
            return None
        
        new = ObservedPart(
            source = data["source"],
            part_code = data["part_code"]
        )
        return new
    
class ObservedPartGetSchema(Schema):
    """
    Schema used to get a observed part from an id field (integer)
    """
    id = fields.Integer(required=True)

    @post_load
    def get_observed_part(self, data, **_):
        return ObservedPart.get_or_none(ObservedPart.id == data["id"])
    
###############################################################
#                           Endpoints                         #
###############################################################

class ObservedPartApi(Resource):
    def get(self):
        """
        Returns all entries of the ObservedPart table.
        """
        result = {"observed_parts": []}

        for op in ObservedPart.select():
            result["observed_parts"].append(
                op.as_dict()
            )
        
        return result, 200
    
    def post(self):
        """
        Creates a new part observation
        """
        new_observed_part = load_schema_or_abort(ObservedPartPostSchema)

        if ObservedPart.get_or_none((ObservedPart.source == new_observed_part.source) & (ObservedPart.part_code == new_observed_part.part_code)) is not None:
            return {"message": "that part is already being observed!"}, 409

        result = do_single_observation(new_observed_part.source, new_observed_part.part_code)
        if result is None:
            return {"message": "Failed to run initial observation, this might mean that the part code is unknown."}, 422
        price, price_euro, stock, name = result
        new_observed_part.name = name
        new_observed_part.save()

        Observation(
            observed_part=new_observed_part,
            usd_price=price,
            eur_price=price_euro,
            stock=stock
        ).save(1)

        return new_observed_part.as_dict(), 201
    
    def delete(self):
        """
        Deletes a part observation and all it observations
        """
        observed_part = load_schema_or_abort(ObservedPartGetSchema)

        # delete all associated observations
        for observation in (Observation.select()
                            .where(Observation.observed_part == observed_part)):
            observation.delete_instance()
        
        observed_part.delete_instance()

        return {}, 204