"""
Too Many Parts Server

Part (and related) models
"""
from tomapa.models import Database, Model
from tomapa.models.storage import StorageLocation

from tomapa.util.helper import convert_value_and_type
from tomapa.util.units import get_base
from tomapa.util.units import get_human_readable

import peewee


class Unit(Model):
    dict_omit = ["base", "smaller", "bigger", "smaller_mul", "bigger_div"]
    name = peewee.CharField()  # "Ω, F, Hz, etc."

    base = peewee.ForeignKeyField("self", null=True)
    smaller = peewee.ForeignKeyField("self", null=True)
    smaller_mul = peewee.IntegerField(default=1000)
    bigger = peewee.ForeignKeyField("self", null=True)
    bigger_div = peewee.IntegerField(default=1000)

    def __str__(self):
        return self.name

    def __call__(self, v):
        return self.get_base(v)


class PartCategory(Model):
    name = peewee.CharField()
    parent = peewee.ForeignKeyField(
        "self", null=True, on_delete="CASCADE", backref="children"
    )


class Part(Model):
    dict_backrefs = {"properties": "part"}

    stock = peewee.IntegerField(default=0)
    category = peewee.ForeignKeyField(PartCategory, backref="parts")
    description = peewee.TextField()
    location = peewee.ForeignKeyField(StorageLocation, backref="parts")


class PartProperty(Model):
    part = peewee.ForeignKeyField(Part, backref="properties")
    name = peewee.CharField()
    display_name = peewee.CharField()

    value = peewee.CharField()
    value_type = peewee.CharField()  # int, float, str, bool

    unit = peewee.ForeignKeyField(Unit, null=True)

    def get_value(self):
        """Returns the value converted to the correct type"""
        return convert_value_and_type(self.value, self.value_type)

    def dict_hook(self):
        if self.unit is None:
            return None

        value = self.get_value()
        if value is None:
            return None

        base_value, base_unit = get_base(value, self.unit)
        hr_value, hr_unit = get_human_readable(value, self.unit)
        return {
            "value": value,
            "base_value": base_value,
            "base_unit": base_unit.as_dict(),
            "hr_value": hr_value,
            "hr_unit": hr_unit.as_dict(),
        }


class PropertyTemplate(Model):
    name = peewee.CharField()
    display_name = peewee.CharField()

    value_type = peewee.CharField()
    unit = peewee.ForeignKeyField(Unit, null=True)


Database.register_models(Unit, PartCategory, Part, PartProperty, PropertyTemplate)
