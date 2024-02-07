from flask_restful import Resource
from flask_restful import abort

from flask import jsonify
from flask import request

import json

from tomapa.models import Database

###############################################################
#                         Schemata                            #
###############################################################


###############################################################
#                           Endpoints                         #
###############################################################


class DatabaseExportApi(Resource):
    def get(self):
        result = Database.get_instance().export()
        return jsonify(result)


class DatabaseImportApi(Resource):
    def post(self):
        if "file" not in request.files:
            abort(400, message="Missing file")

        file = request.files["file"]
        filename = file.filename
        if filename == "":
            abort(400, message="Missing file")

        print("Received file: ", filename)

        if "." in filename and filename.rsplit(".", 1)[1].lower() == "json":
            data = json.load(file)
            print(data)
            try:
                Database.get_instance().import_data(data)
                return {}, 200
            except:
                pass

        abort(409, message="Failed to import data")

    def put(self):
        try:
            data = request.json
            Database.get_instance().import_data(data)
            return {}, 200
        except:
            abort(409, message="Failed to import data")
