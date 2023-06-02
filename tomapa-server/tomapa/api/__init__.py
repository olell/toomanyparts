from marshmallow import ValidationError
from flask_restful import abort

from flask import request


def load_schema_or_abort(schema, source="json"):
    """Loads the given marshmallow schema or abort the request"""
    if source == "args":
        source = request.args
    elif source == "json":
        source = request.json
    elif source == "form":
        source = request.form
    else:
        raise ValueError("source must be one of args/json/form")

    try:
        result = schema().load(source)
        if result is None:
            abort(404, message="Not found!")
        return result
    except ValidationError as e:
        return abort(400, message=e.messages_dict)
