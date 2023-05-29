from flask_restful import Resource

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort
from tomapa.models.parts import Part

from tomapa.util.unitparse import parse_unit_token
from tomapa.util.units import get_base

from math import isclose


class SearchGetSchema(Schema):
    query = fields.String(required=True)

    @post_load
    def search_parts(self, data, **_):
        query = data.get("query", None)
        if query is None:
            return None

        tokens = query.split()
        query = query.lower()

        all_parts = Part.select()
        search_results = []
        for part in all_parts:
            does_match = False

            if (
                query in part.description.lower()
                or query in part.location.name.lower()
                or query in part.category.name.lower()
            ):
                does_match = True

            values = []
            for token in tokens:
                value, unit = parse_unit_token(token)
                if value is not None and unit is not None:
                    values.append(get_base(value, unit))

            print(values)

            for property in part.properties:
                if query in property.value.lower():
                    does_match = True
                for value, unit in values:
                    print(part.id, property.get_value(), value)
                    if type(property.get_value()) != float:
                        if property.get_value() == value and property.unit == unit:
                            does_match = True
                    else:
                        if (
                            isclose(property.get_value(), value)
                            and property.unit == unit
                        ):
                            does_match = True

            if does_match:
                search_results.append(part)

        return search_results


class SearchApi(Resource):
    def get(self):
        parts = []
        for part in load_schema_or_abort(SearchGetSchema, "args"):
            parts.append(
                part.as_dict(omit=["category"], custom={"category": part.category_id})
            )
        return {"parts": parts}
