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
