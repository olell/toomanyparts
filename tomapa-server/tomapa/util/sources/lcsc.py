import requests
from tomapa.util.unitparse import parse_unit_token

lcsc_param_to_property = {
    "param_10835_n": ["r", "Resistance"],
    "param_10837_n": ["p", "Power"],
    "param_11155_n": ["v_max", "Max. Voltage"],
    "param_10836_s": ["tolerance", "Tolerance"],
}


def get_lcsc_data(pc):
    """
    Returns information about a part from LCSC
    """

    # Checking that a "valid" product code is specified
    if pc is None:
        return

    # Else requesting new data from lcsc
    req = requests.get(f"https://wmsc.lcsc.com/wmsc/product/detail?productCode={pc}")

    if req.status_code == 200:
        data = req.json().get("result", {})

    else:
        return None

    output = {}
    properties = []

    # Extracting fields from data
    description = data.get("productIntroEn", None)
    if description is not None:
        output.update({"description": description})

    # "static" fields
    package = data.get("encapStandard", None)
    if package is not None:
        properties.append(
            {
                "name": "package",
                "display_name": "Package",
                "value": package,
                "value_type": "str",
            }
        )

    mfr = data.get("brandNameEn", None)
    if mfr is not None:
        properties.append(
            {
                "name": "mfr",
                "display_name": "Manufacturer",
                "value": mfr,
                "value_type": "str",
            }
        )

    mfr_no = data.get("productModel", None)
    if mfr_no is not None:
        properties.append(
            {
                "name": "mfr_no",
                "display_name": "Manufacturer Part #",
                "value": mfr_no,
                "value_type": "str",
            }
        )

    # Dynamic fields
    for param in data.get("paramVOList", []):
        param_code = param["paramCode"]
        value, unit = parse_unit_token(param["paramValue"])
        string_value = param.get("paramValueEn", None)
        known_param = lcsc_param_to_property.get(param_code, None)

        if value is not None and unit is not None:
            if known_param is not None:
                properties.append(
                    {
                        "name": known_param[0],
                        "display_name": known_param[1],
                        "value": value,
                        "value_type": "float",
                        "unit": unit.id,
                    }
                )
                continue
        if string_value is not None:
            if known_param is not None:
                properties.append(
                    {
                        "name": known_param[0],
                        "display_name": known_param[1],
                        "value": string_value,
                        "value_type": "str",
                    }
                )
                continue

    # "docs"
    datasheet = data.get("pdfUrl", None)
    if datasheet is not None:
        output.update({"datasheet": datasheet})
    images = data.get("productImages", [])
    if len(images) > 0:
        image = images[0]
        output.update({"imageUrl": image})

    output.update({"properties": properties})

    return output
