from tomapa.models import Database, Model
from tomapa.models.parts import Part

import peewee


class BOM(Model):
    dict_backrefs = {"parts": "bom"}
    name = peewee.CharField()
    description = peewee.TextField(default="")

    # PCB image path
    pcb_image = peewee.CharField(null=True)

    def get_part_count(self):
        count = 0
        for part in self.parts:
            count += part.get_count()
        return count


class BOMPart(Model):
    dict_backrefs = {"designators": "bom_part"}
    child_omit = {"part": ["category"]}
    bom = peewee.ForeignKeyField(BOM, backref="parts")
    part = peewee.ForeignKeyField(Part)

    def get_count(self):
        return len(self.designators)  # backref from BOMPartDesignator


class BOMPartDesignator(Model):
    bom_part = peewee.ForeignKeyField(BOMPart, backref="designators")
    name = peewee.CharField()

    location_x = peewee.FloatField(default=-1)
    location_y = peewee.FloatField(default=-1)


Database.register_models(BOM, BOMPart, BOMPartDesignator)
