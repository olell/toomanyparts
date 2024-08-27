from flask_restful import Resource

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort
from tomapa.models.parts import Part
from tomapa.models.parts import Unit
from tomapa.models.parts import StorageLocation
from tomapa.models.parts import PartCategory
from tomapa.models.parts import PartProperty

from tomapa.util.unitparse import parse_unit_token
from tomapa.util.units import get_base

from math import isclose


class SearchGetSchema(Schema):
    query = fields.String(required=True)


    @post_load
    def search_parts(self, data, **_):
        query = data.get("query", None)
        if query is None or query == "":
            return None

        tokens = query.split()
        query = query.lower()

        # search by id
        if query.startswith("#"):
            try:
                part_id = int(query[1:])
                part_by_id = Part.get_or_none(Part.id == part_id)
                if part_by_id is not None:
                    return [part_by_id]
            except:
                pass

        all_parts = Part.select()
        all_units = list(Unit.select())
        all_properties = PartProperty.select()

        # Querying locations and categories contianing the given search query case insensitive
        wildcard_query = "%{0}%".format(query)
        matching_locations = [x.id for x in StorageLocation.select(StorageLocation.id).where(StorageLocation.name ** wildcard_query)]
        matching_categories = [x.id for x in PartCategory.select(PartCategory.id).where(PartCategory.name ** wildcard_query)]

        string_matching_properties = [x.part_id for x in PartProperty.select(PartProperty.part_id).where(PartProperty.value ** wildcard_query)]

        search_results = set()
        for part in all_parts:
            if (
                query in part.description.lower() or
                part.location_id in matching_locations or
                part.category_id in matching_categories or
                part.id in string_matching_properties
            ):
                search_results.add(part.id)

        values = []
        for token in tokens:
            value, unit = parse_unit_token(token, all_units=all_units)
            if value is not None and unit is not None:
                values.append(get_base(value, unit))
                
        for property in all_properties:
            if property.part_id in search_results: continue

            for value, unit in values:
                if type(property.get_value()) != float:
                    if property.get_value() == value and property.unit_id == unit.id:
                        search_results.add(property.part_id)
                else:
                    if (
                        isclose(property.get_value(), value)
                        and property.unit == unit
                    ):
                        search_results.add(property.part_id)

        result_parts = []
        for pid in search_results:
            for part in all_parts:
                if part.id == pid:
                    result_parts.append(part)

        return result_parts


class SearchApi(Resource):
    def get(self):
        parts = []
        for part in load_schema_or_abort(SearchGetSchema, "args"):
            parts.append(
                part.as_dict(omit=["category"], custom={"category": part.category_id})
            )
        return {"parts": parts}
