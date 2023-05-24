from flask_restful import Resource
from flask_restful import abort

from flask import send_from_directory
from flask import request
from flask import current_app

import os
import uuid

from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load

from tomapa.api import load_schema_or_abort

from tomapa.models.docs import PartDocument
from tomapa.models.parts import Part

###############################################################
#                         Schemata                            #
###############################################################


class DocumentGetSchema(Schema):
    id = fields.Integer(required=True)

    @post_load
    def get_document(self, data, **_):
        return PartDocument.get_or_none(PartDocument.id == data["id"])


class DocumentPostSchema(Schema):
    type = fields.String(required=True)
    part = fields.Integer(required=True)


###############################################################
#                           Endpoints                         #
###############################################################


class DocumentApi(Resource):
    def get(self):
        doc = load_schema_or_abort(DocumentGetSchema, "args")
        return send_from_directory(current_app.config["UPLOAD_DIR"], doc.path)

    def post(self):
        if "file" not in request.files:
            abort(400, message="Missing file")
        file = request.files["file"]
        filename = file.filename
        if filename == "":
            abort(400, message="Missing file")

        data = load_schema_or_abort(DocumentPostSchema, source="form")

        part = Part.get_or_none(Part.id == data["part"])
        if part is None:
            abort(404, "Unknown part")

        if "." in filename and filename.rsplit(".", 1)[1].lower() in {
            "pdf",
            "png",
            "jpg",
            "jpeg",
        }:
            filename = str(uuid.uuid4()) + "." + filename.rsplit(".", 1)[1].lower()
            file.save(os.path.join(current_app.config["UPLOAD_DIR"], filename))

            doc = PartDocument(part=part, type=data["type"], path=filename)
            doc.save()

            return doc.as_dict(custom={"part": doc.part.id}), 200
        return {}, 400
