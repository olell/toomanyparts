from marshmallow import ValidationError
from flask_restful import abort

from flask import request


def load_schema_or_abort(schema, source="json"):
    """Loads the given marshmallow schema or abort the request"""
    try:
        source = request.args if source == "args" else request.json
        result = schema().load(source)
        if result is None:
            abort(404, message="Not found!")
        return result
    except ValidationError as e:
        return abort(400, message=e.messages_dict)
