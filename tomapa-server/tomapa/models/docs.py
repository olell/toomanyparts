from tomapa.models import Database, Model
from tomapa.models.parts import Part

import peewee


class PartDocument(Model):
    part = peewee.ForeignKeyField(Part, backref="docs")

    type = peewee.CharField()  # image, datasheet, invoice, etc.
    path = peewee.CharField()


Database.register_models(PartDocument)
