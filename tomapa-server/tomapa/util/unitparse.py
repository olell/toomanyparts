from tomapa.models.parts import Unit


def parse_unit_token(token, all_units=None):
    """
    tries to parse smth like 100mW to int(100), Unit(mW)
    """

    if all_units is None: all_units = list(Unit.select())
    all_units.sort(key=lambda x: -len(x.name))

    target_unit = None
    for unit in all_units:
        if token.endswith(unit.name):
            target_unit = unit
            break

    if target_unit is None:
        return None, None

    value = token.replace(target_unit.name, "")
    target_value = None

    try:
        target_value = float(value)
        return target_value, target_unit
    except ValueError:
        return None, None
