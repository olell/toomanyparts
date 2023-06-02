from flask_restful import Resource
from flask_restful import abort
from flask import request
from marshmallow import Schema, fields, post_load

import csv
import io

from tomapa.api import load_schema_or_abort
from tomapa.models.parts import Part
from tomapa.models.bom import BOM
from tomapa.models.bom import BOMPart
from tomapa.models.bom import BOMPartDesignator


###############################################################
#                         Schemata                            #
###############################################################


class BOMGetSchema(Schema):
    """
    Schema used to get a bom
    """

    id = fields.Integer(required=True)

    @post_load
    def get_bom(self, data, **_):
        return BOM.get_or_none(BOM.id == data["id"])


class BOMPostSchema(Schema):
    """
    Schema used to get data about bom in post req
    (bom data comes from csv file)
    """

    name = fields.String(required=True)
    description = fields.String()


###############################################################
#                           Endpoints                         #
###############################################################


class BOMsApi(Resource):
    def get(self):
        """
        Returns all available BOMs
        """
        boms = [
            bom.as_dict(custom={"parts": bom.get_part_count()}) for bom in BOM.select()
        ]
        return {"boms": boms}


class BOMApi(Resource):
    def get(self):
        """
        Returns the requested BOM
        """
        return load_schema_or_abort(BOMGetSchema, "args").as_dict()

    def post(self):
        """Creats a BOM from a given CSV file"""
        if not "file" in request.files:
            abort(400, message="Missing file")

        file = request.files["file"]
        filename = file.filename
        if filename == "":
            abort(400, message="Missing file")

        # Loading/Reading posted csv file with bytesio
        bom_data = []
        with io.BytesIO() as buf:
            file.save(buf)
            buf.seek(0)
            reader = csv.DictReader(io.TextIOWrapper(buf))
            bom_data = [row for row in reader]

        parts = []
        for row in bom_data:
            designators = row.get("Reference", None)
            part_id = row.get("PartID", None)

            # Skipping row if designators or part_id is missing
            if (
                designators is None
                or designators == ""
                or part_id is None
                or part_id == ""
            ):
                continue

            try:
                part_id = int(part_id)
            except ValueError:
                continue  # skip row if part_id is not an integer

            part = Part.get_or_none(Part.id == part_id)
            if part is None:
                continue

            designators = [d.strip() for d in designators.split(",")]

            parts.append((part, designators))

        # Aborting if no valid parts in BOM
        if len(parts) == 0:
            abort(400, message="No valid Parts found in BOM")

        # Loading metadata (name, description)
        metadata = load_schema_or_abort(BOMPostSchema, "form")

        # Creating BOM
        bom = BOM(name=metadata["name"], description=metadata.get("description", ""))
        bom.save(1)

        # Creating BOMParts
        for part, designators in parts:
            bom_part = BOMPart(bom=bom, part=part)
            bom_part.save(1)

            # Creating BOMPartDesignators
            for designator in designators:
                bom_part_designator = BOMPartDesignator(
                    bom_part=bom_part, name=designator
                )
                bom_part_designator.save()

        bom_json = bom.as_dict()
        return {"bom": bom_json}, 200

    def delete(self):
        bom = load_schema_or_abort(BOMGetSchema)

        # deleting parts
        for part in bom.parts:
            # deleting designators
            for designator in part.designators:
                designator.delete_instance()

            part.delete_instance()

        bom.delete_instance()

        return {}, 204
