from flask_restful import Resource
from flask_restful import abort

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


class CategoryPostSchema(Schema):
    name = fields.String(required=True)
    parent = fields.Integer()

    @post_load
    def create_category(self, data, **_):
        parent_id = data.get("parent", None)
        parent = None
        if parent_id is not None:  # If a parent parameter is given
            # get the parent model
            parent = PartCategory.get_or_none(PartCategory.id == parent_id)
            # if there is no such parent
            if parent is None:  # abort
                return None

        new = PartCategory(name=data["name"], parent=parent)
        return new


class CategoriesApi(Resource):
    def get(self):
        """
        Returns a tree of available categories.
        Apply the flat get-parameter to get the categories flattened
        """
        args = load_schema_or_abort(CategoriesGetSchema, "args")
        if args.get("flat") is not None:
            return get_categories_flat(), 200
        return get_categories_tree(), 200


class CategoryApi(Resource):
    def get(self):
        category = load_schema_or_abort(CategoryGetSchema, "args")
        return category.as_dict(), 200

    def post(self):
        new_category = load_schema_or_abort(CategoryPostSchema)

        available_with_same_name = PartCategory.get_or_none(
            PartCategory.name == new_category.name
        )
        if available_with_same_name is not None:
            abort(409, message="Category name already in use")

        new_category.save()
        return new_category.as_dict(), 201

    def delete(self):
        category = load_schema_or_abort(CategoryGetSchema)
        category.delete_instance(recursive=True)

        return {}, 204
