def get_bigger(value, unit):
    """Returns the given value transformed to the next bigger unit"""
    if unit.bigger_id is None:
        return value, unit
    else:
        return value / unit.bigger_div, unit.bigger


def get_smaller(value, unit):
    """Returns the given value transformed to the next smaller unit"""
    if unit.smaller_id is None:
        return value, unit
    else:
        return value * unit.smaller_mul, unit.smaller


def _hr_bigger(value, unit):
    """Returns the given value transformed to the biggest unit where
    the value is above 1"""
    while value >= 1:
        _prev = unit
        value, unit = get_bigger(value, unit)
        if _prev == unit:
            return value, unit
    return get_smaller(value, unit)


def _hr_smaller(value, unit):
    """Returns the given value transformed to the smallest unit where
    the value is below 1000"""
    while value < 1000:
        _prev = unit
        value, unit = get_smaller(value, unit)
        if _prev == unit:
            return value, unit
    return get_bigger(value, unit)


def get_human_readable(value, unit):
    """Returns the given value converted to the "human readable" unit,
    for example 1000nF will become 1uF or 0.1uF will become 100nF"""
    if value >= 1 and value < 1000:
        return value, unit
    elif value < 1:
        return _hr_smaller(value, unit)
    elif value >= 1000:
        return _hr_bigger(value, unit)


def get_base(value, unit):
    if unit.base is None or unit.base == unit:
        return value, unit
    # This is a bit hacky, but in the first step I go to the biggest value and after that
    # I go from the biggest to the smallest. If I reach the base at any point the value is
    # returned
    while unit.smaller_id is not None:
        value, unit = get_smaller(value, unit)
        if unit.base == unit:
            return value, unit
    while unit.bigger_id is not None:
        value, unit = get_bigger(value, unit)
        if unit.base == unit:
            return value, unit
    return value, unit


def get_unit_group(unit):
    units = list()

    while unit.smaller_id is not None:
        unit = unit.smaller
    units.append(unit)
    while unit.bigger_id is not None:
        unit = unit.bigger
        units.append(unit)

    return units
