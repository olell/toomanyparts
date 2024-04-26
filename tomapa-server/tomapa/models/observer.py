from tomapa.models import Database, Model

from datetime import datetime
import time

import peewee


class ObservedPart(Model):
    source = peewee.CharField()  # merchant (LCSC, Mouser, etc.)

    part_code = peewee.CharField()

    def dict_hook(self):
        observations = (
            Observation.select()
            .where(Observation.observed_part == self)
            .order_by(Observation.created_at)
            .limit(100)
        )
        return {
            "observations": [
                o.as_dict() for o in observations
            ]
        }


class Observation(Model):
    dict_omit = ["observed_part"]
    observed_part = peewee.ForeignKeyField(
        ObservedPart, backref="observations", on_delete="CASCADE"
    )

    stock = peewee.IntegerField()
    usd_price = peewee.FloatField()

    created_at = peewee.DateTimeField(default=datetime.now)

    def dict_hook(self):
        return {
            "created_at": time.mktime(self.created_at.timetuple())
        }


Database.register_models(ObservedPart, Observation)
