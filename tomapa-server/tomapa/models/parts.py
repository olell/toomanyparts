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
    smaller_div = peewee.IntegerField(default=1000)
    bigger = peewee.ForeignKeyField("self", null=True)
    bigger_mul = peewee.IntegerField(default=1000)


class PartCategory(Model):
    name = peewee.CharField()


class Part(Model):
    stock = peewee.IntegerField(default=0)
    category = peewee.ForeignKeyField(PartCategory)
    description = peewee.TextField()


class PartProperty(Model):
    name = peewee.CharField()
    display_name = peewee.CharField()

    value = peewee.CharField()
    value_type = peewee.CharField()  # int, float, string

    unit = peewee.ForeignKeyField(Unit)


Database.register_models(Unit, PartCategory, Part, PartProperty)
