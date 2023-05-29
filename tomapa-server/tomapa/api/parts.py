from flask_restful import Resource
from flask import current_app

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort

from tomapa.models.parts import Part
from tomapa.models.parts import PartCategory
from tomapa.models.storage import StorageLocation
from tomapa.models.docs import PartDocument

from tomapa.api.properties import PartPropertyPostSchema

from tomapa.util.categories import is_part_in_child_category
from tomapa.util.label import generate_label

import requests
import os
import uuid


###############################################################
#                         Schemata                            #
###############################################################
class PartGetSchema(Schema):
    """
    Schema used to get a part
    """

    id = fields.Integer(required=True)

    @post_load
    def get_part(self, data, **_):
        return Part.get_or_none(Part.id == data["id"])


class PartPostSchema(Schema):
    """
    Schema used to create a part. Creates a Part model and saves
    it to db!
    """

    stock = fields.Integer(default=0)
    category = fields.Integer(required=True)
    description = fields.String(required=True)
    location = fields.Integer(required=True)

    image_url = fields.String()
    datasheet_url = fields.String()

    properties = fields.List(fields.Nested(PartPropertyPostSchema))

    @post_load
    def create_part(self, data, **_):
        category = PartCategory.get_or_none(PartCategory.id == data["category"])
        location = StorageLocation.get_or_none(StorageLocation.id == data["location"])
        if category is None or location is None:
            return None

        new_part = Part(
            stock=data.get("stock", 0),
            category=category,
            description=data["description"],
            location=location,
        )

        new_part.save(1)

        for property in data.get("properties", []):
            property.part = new_part
            property.save(1)

        image_url = data.get("image_url", None)
        if image_url is not None:
            req = requests.get(image_url)
            if req.status_code == 200:
                filename = str(uuid.uuid4()) + "." + image_url.rsplit(".", 1)[1].lower()
                with open(
                    os.path.join(current_app.config["UPLOAD_DIR"], filename), "wb+"
                ) as target:
                    target.write(req.content)

                doc = PartDocument(part=new_part, type="image", path=filename)
                doc.save()

        datasheet_url = data.get("datasheet_url", None)
        if datasheet_url is not None:
            req = requests.get(datasheet_url)
            if req.status_code == 200:
                filename = (
                    str(uuid.uuid4()) + "." + datasheet_url.rsplit(".", 1)[1].lower()
                )
                with open(
                    os.path.join(current_app.config["UPLOAD_DIR"], filename), "wb+"
                ) as target:
                    target.write(req.content)

                doc = PartDocument(part=new_part, type="datasheet", path=filename)
                doc.save()

        # Generating label
        label_fn = str(uuid.uuid4()) + ".pdf"
        label_path = os.path.join(current_app.config["UPLOAD_DIR"], label_fn)
        generate_label(new_part, label_path)
        doc = PartDocument(part=new_part, type="label", path=label_fn)
        doc.save()

        return new_part


class PartPutSchema(Schema):
    """
    Schema used to update an existing part and its properties
    """

    id = fields.Integer(required=True)
    stock = fields.Integer()
    category = fields.Integer()
    description = fields.String()
    location = fields.Integer()

    @post_load
    def update_part(self, data, **_):
        part = Part.get_or_none(Part.id == data["id"])
        if part is None:
            return None

        new_stock = data.get("stock", None)
        if new_stock is not None:
            part.stock = new_stock

        new_category_id = data.get("category", None)
        if new_category_id is not None:
            new_category = PartCategory.get_or_none(PartCategory.id == new_category_id)
            if new_category is None:
                return None
            part.category = new_category

        new_description = data.get("description", None)
        if new_description is not None:
            part.description = new_description

        new_location_id = data.get("location", None)
        if new_location_id is not None:
            new_location = StorageLocation.get_or_none(
                StorageLocation.id == new_location_id
            )
            if new_location is None:
                return None
            part.location = new_location

        part.save()
        return part


class PartsGetFilterSchema(Schema):
    """
    Get parts filtered by different criteria. All filters
    in a request are applied.
    """

    # The part is in the given category
    category = fields.Integer()
    # The part might also be in one of the categories children (default true)
    category_children = fields.Bool()

    @post_load
    def filter_parts(self, data, **_):
        # Category filter: Get category model
        category_id = data.get("category", None)
        category_children = data.get("category_children", True)

        category = None
        if category_id is not None:
            category = PartCategory.get_or_none(PartCategory.id == category_id)
            if category is None:
                return None  # Category id in params invalid

        # Check if no filter is applied
        no_filter = False
        if (
            category is None
        ):  # TODO: Add every implemented filter here! (or xyz is None or abc is None etc...)
            no_filter = True

        # Get list of parts to filter from
        all_parts = Part.select()
        filtered_parts = set()
        for part in all_parts:
            if category is not None:  # Category filter
                if category_children:
                    if is_part_in_child_category(part, category):
                        filtered_parts.add(part)
                else:
                    if part.category == category:
                        filtered_parts.add(part)

            if no_filter:
                filtered_parts.add(part)
        return filtered_parts


###############################################################
#                           Endpoints                         #
###############################################################


class PartApi(Resource):
    def get(self):
        part = load_schema_or_abort(PartGetSchema, "args")
        return part.as_dict(), 200

    def post(self):
        new_part = load_schema_or_abort(PartPostSchema)
        return new_part.as_dict(), 200

    def put(self):
        updated_part = load_schema_or_abort(PartPutSchema)
        return updated_part.as_dict(), 200

    def delete(self):
        part = load_schema_or_abort(PartGetSchema)

        for property in part.properties:
            property.delete_instance()

        for doc in part.docs:
            try:
                os.path.join(current_app.config["UPLOAD_DIR"], doc.path)
            except:
                pass
            doc.delete_instance()

        part.delete_instance()

        return {}, 204


class PartsApi(Resource):
    def get(self):
        parts = []
        for part in load_schema_or_abort(PartsGetFilterSchema, "args"):
            parts.append(part.as_dict())
        return {"parts": parts}
