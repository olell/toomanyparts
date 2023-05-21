"""
Too Many Parts Server

Part (and related) models
"""
from tomapa.models import Database, Model

import peewee


class Unit(Model):
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
    parent = peewee.ForeignKeyField("self", null=True)


class Part(Model):
    stock = peewee.IntegerField(default=0)
    category = peewee.ForeignKeyField(PartCategory)
    description = peewee.TextField()


class PartProperty(Model):
    name = peewee.CharField()
    display_name = peewee.CharField()

    value = peewee.CharField()
    value_type = peewee.CharField()  # int, float, str, bool

    unit = peewee.ForeignKeyField(Unit, null=True)

    def value(self):
        """Returns the value converted to the correct type"""
        try:
            if self.value_type == "int":
                return int(self.value)
            if self.value_type == "float":
                return float(self.value)
            if self.value_type == "bool":
                return self.value == "True"
            if self.value_type == str:
                return self.value
        except:
            pass
        return None


class PropertyTemplate(Model):
    name = peewee.CharField()
    display_name = peewee.CharField()

    value_type = peewee.CharField()
    unit = peewee.ForeignKeyField(Unit, null=True)


Database.register_models(Unit, PartCategory, Part, PartProperty, PropertyTemplate)
