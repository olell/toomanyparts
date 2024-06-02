from flask_restful import Resource

from tomapa.models.parts import Part
from tomapa.models.parts import PartProperty


class StockApi(Resource):
    def get(self):
        all_parts = Part.select()
        min_stock_properties = PartProperty.select().where(
            PartProperty.name == "min_stock"
        )

        notify_parts = set()
        for part in all_parts:
            if part.stock == 0:
                notify_parts.add(part)
            for prop in min_stock_properties:
                value = prop.get_value()
                if type(value) == int and prop.part == part and part.stock <= value:
                    notify_parts.add(part)

        return {
            "low_stock": [part.as_dict(omit=["category"]) for part in notify_parts]
        }, 200
