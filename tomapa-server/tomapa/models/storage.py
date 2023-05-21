from tomapa.models import Database, Model
import peewee


class StorageLocation(Model):
    name = peewee.CharField()


Database.register_models(StorageLocation)
