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

    def get_bigger(self, value):
        """Returns the given value transformed to the next bigger unit"""
        if self.bigger is None:
            return value, self
        else:
            return value / self.bigger_div, self.bigger

    def get_smaller(self, value):
        """Returns the given value transformed to the next smaller unit"""
        if self.smaller is None:
            return value, self
        else:
            return value * self.smaller_mul, self.smaller

    def get_biggest(self, value):
        """Returns the given value transformed to the biggest unit where
        the value is above 1"""
        unit = self
        while value >= 1:
            _prev = unit
            value, unit = unit.get_bigger(value)
            if _prev == unit:
                return value, unit
        return unit.get_smaller(value)

    def get_smallest(self, value):
        """Returns the given value transformed to the smallest unit where
        the value is below 1000"""
        unit = self
        while value < 1000:
            _prev = unit
            value, unit = unit.get_smaller(value)
            if _prev == unit:
                return value, unit
        return unit.get_bigger(value)

    def __str__(self):
        return self.name


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
