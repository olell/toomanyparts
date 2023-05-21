from marshmallow import ValidationError
from flask_restful import abort


def load_schema_or_abort(schema, data):
    """Loads the given marshmallow schema or abort the request"""
    try:
        result = schema().load(data)
        if result is None:
            abort(404, message="Not found!")
        return result
    except ValidationError as e:
        return abort(400, message=e.messages_dict)
