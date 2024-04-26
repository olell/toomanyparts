from tomapa.models.observer import ObservedPart
from tomapa.models.observer import Observation

from tomapa.util.sources.lcsc import get_lcsc_data

def do_observations(parts=None):
    if parts is None:
        observed_parts = ObservedPart.select()
    else:
        observed_parts = parts

    for op in observed_parts:
        try:
            if op.source.lower() == "lcsc":
                data = get_lcsc_data(op.part_code)
                price = data.get("price", -1)
                stock = data.get("stock", -1)

                if price >= 0 and stock >= 0:
                    observation = Observation(
                        observed_part=op,
                        stock=stock,
                        usd_price=price
                    )

                    observation.save(1)


            if op.source.lower() == "mouser":
                ...
        except:
            print("Error while observing parts")

    print("Observations done")