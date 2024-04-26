from tomapa.models.observer import ObservedPart
from tomapa.models.observer import Observation

from tomapa.util.sources.lcsc import get_lcsc_data

def do_single_observation(source, part_code):
    if source.lower() == "lcsc":
        data = get_lcsc_data(part_code)
        price = data.get("price", -1)
        stock = data.get("stock", -1)
        name = data.get("title", "")

        if price >= 0 and stock >= 0:
            return price, stock, name

    if source.lower() == "mouser":
        ...

    return None


def do_observations():
    observed_parts = ObservedPart.select()

    for op in observed_parts:
        try:
            data = do_single_observation(op.source, op.part_code)
            print(data)
            if data is None:
                continue
        
            stock, price, _name = data
            observation = Observation(
                observed_part=op,
                stock=stock,
                usd_price=price
            )

            observation.save(1)
            print(f"Saved observation for {op.name} ({stock}, {price}, {_name})")
            
        except Exception as e:
            print("Error while observing parts", e)

    print("Observations done")