from flask_restful import Resource

from flask import request

from tomapa.util.categories import get_categories_tree
from tomapa.util.categories import get_categories_flat

from tomapa.models.parts import PartCategory

from tomapa.api import load_schema_or_abort

from marshmallow import Schema, fields, post_load


class CategoriesGetSchema(Schema):
    flat = fields.String(required=False, allow_none=True)


class CategoryGetSchema(Schema):
    id = fields.Integer(required=True)

    @post_load
    def get_category(self, data, **_):
        return PartCategory.get_or_none(PartCategory.id == data["id"])


class CategoriesApi(Resource):
    def get(self):
        """
        Returns a tree of available categories.
        Apply the flat get-parameter to get the categories flattened
        """
        args = load_schema_or_abort(CategoriesGetSchema, request.args)
        if args.get("flat") is not None:
            return get_categories_flat(), 200
        return get_categories_tree(), 200


class CategoryApi(Resource):
    def get(self):
        category = load_schema_or_abort(CategoryGetSchema, request.args)
        return {
            "id": category.id,
            "name": category.name,
            "parent": category.parent.id if category.parent is not None else None,
        }
