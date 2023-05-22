def is_safe_json(data):
    if data is None:
        return True
    elif isinstance(data, (bool, int, float, str)):
        return True
    elif isinstance(data, (tuple, list)):
        return all(is_safe_json(x) for x in data)
    elif isinstance(data, dict):
        return all(isinstance(k, str) and is_safe_json(v) for k, v in data.items())
    return False


def convert_value_and_type(value, value_type):
    try:
        if value_type == "int":
            return int(value)
        if value_type == "float":
            return float(value)
        if value_type == "bool":
            return value == "True"
        if value_type == "str":
            return value
    except:
        pass
    return None
