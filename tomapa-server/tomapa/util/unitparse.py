from tomapa.models.parts import Unit


def parse_unit_token(token):
    """
    tries to parse smth like 100mW to int(100), Unit(mW)
    """

    all_units = [unit.name for unit in Unit.select()]
    all_units.sort(key=lambda x: -len(x))

    target_unit = None
    for unit in all_units:
        if token.endswith(unit):
            target_unit = Unit.get_or_none(Unit.name == unit)
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
