from tomapa.util.unitparse import parse_unit_token
from tomapa.models.parts import PartProperty
from tomapa.models.parts import Part
from tomapa.models.storage import StorageLocation
from tomapa.models.parts import PartCategory
from tomapa.models.docs import PartDocument

from flask import current_app

import uuid
import requests
import csv
from io import StringIO
import re
import os


def most_similar_string(target, candidates):
    ta = re.split("\\-| |\\,|\\_|\\(|\\)|\\/", target.lower())
    best = None
    best_score = -1
    for candidate in candidates:
        tb = re.split("\\-| |\\,|\\_|\\(|\\)|\\/", candidate.lower())
        score = sum(
            [sum([a in b or b in a for a in ta if a != ""]) for b in tb if b != ""]
        )
        if score > best_score:
            best_score = score
            best = candidate

    return best


lcsc_param_to_property = {
    "param_10835_n": ["r", "Resistance"],
    "param_10837_n": ["p", "Power"],
    "param_11155_n": ["v_max", "Max. Voltage"],
    "param_10836_s": ["tolerance", "Tolerance"],
    "param_10953_n": ["v", "Voltage"],
    "param_10951_n": ["c", "Capacitance"],
    "param_10954": ["tcc", "Temperature Coefficient"],
    "param_13455_n": ["amp_max", "Max. Current"],
    "param_13846_n": ["amp", "Current"],
    "param_11373_n": ["f", "Frequency"],
    "param_11376_n": ["c", "Capacitance"],  # "load capacitance"
}  # Todo: this list is not even close to being complete


def get_lcsc_data(pc, data_as_obj=False):
    """
    Returns information about a part from LCSC
    """

    # Checking that a "valid" product code is specified
    if pc is None:
        return

    # Else requesting new data from lcsc
    req = requests.get(
        f"https://wmsc.lcsc.com/wmsc/product/detail?productCode={pc}",
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0"
        },
    )

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
    param_list = data.get("paramVOList", [])
    if param_list is not None:
        for param in param_list:
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
                            "unit": unit if data_as_obj else unit.id,
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

    # Category
    source_category = data.get("catalogName", None)
    if source_category is not None:
        all_categories = PartCategory.select()
        category_names = [x.name for x in all_categories]
        closest = most_similar_string(source_category, category_names)
        for category in all_categories:
            if category.name == closest:
                if not data_as_obj:
                    output.update({"category": category.id})
                else:
                    output.update({"category": category})

    output.update({"properties": properties})

    return output


def import_lcsc_order(csv_text, create_missing_parts=True):
    reader = csv.reader(StringIO(csv_text))
    header = None
    data = []
    for row in reader:
        if header is None:
            header = row
        else:
            data.append(dict(zip(header, row)))

    created_parts = []
    modified_parts = []

    for row in data:
        source_no = row["LCSC Part Number"]
        qty = row["Order Qty."]

        part = None

        # Trying to get a part with src==LCSC & src_id=={source_no}
        av_part_prop = PartProperty.get_or_none(
            PartProperty.name == "src_no" & PartProperty.value == source_no
        )
        if (
            av_part_prop is not None
            and PartProperty.select()
            .where(
                PartProperty.name
                == "src" & PartProperty.value
                == "LCSC" & PartProperty.part_id
                == av_part_prop.part_id
            )
            .count()
        ):
            part = av_part_prop.part
            part.stock += qty
            part.save()
            modified_parts.append(part)

        # If not part is found, create a new one
        if part is None and create_missing_parts:
            part_data = get_lcsc_data(source_no, data_as_obj=True)
            if part_data is None:
                continue

            default_location = StorageLocation.get_or_none(StorageLocation.id == 1)
            category = part_data.get("category", None)
            if category is None:  # defaulting to first category
                category = PartCategory.get_or_none(PartCategory.id == 1)

            part = Part(
                stock=qty,
                category=category,
                description=part_data.get("description", ""),
                location=default_location,
            )
            part.save(1)

            for property in part_data.get("properties", []):
                prop = PartProperty(
                    part=part,
                    name=property["name"],
                    display_name=property["display_name"],
                    value=str(property["value"]),
                    value_type=property["value_type"],
                    unit=property.get("unit", None),
                )
                prop.save(1)

            image_url = part_data.get("imageUrl", None)
            if image_url is not None:
                req = requests.get(
                    image_url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0"
                    },
                )
                if req.status_code == 200:
                    filename = (
                        str(uuid.uuid4()) + "." + image_url.rsplit(".", 1)[1].lower()
                    )
                    with open(
                        os.path.join(current_app.config["UPLOAD_DIR"], filename), "wb+"
                    ) as target:
                        target.write(req.content)

                    doc = PartDocument(part=part, type="image", path=filename)
                    doc.save()

            datasheet_url = part_data.get("datasheet", None)
            if datasheet_url is not None:
                req = requests.get(
                    datasheet_url,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/113.0"
                    },
                )
                if req.status_code == 200:
                    filename = (
                        str(uuid.uuid4())
                        + "."
                        + datasheet_url.rsplit(".", 1)[1].lower()
                    )
                    with open(
                        os.path.join(current_app.config["UPLOAD_DIR"], filename), "wb+"
                    ) as target:
                        target.write(req.content)

                    doc = PartDocument(part=part, type="datasheet", path=filename)
                    doc.save()

            created_parts.append(part)

    return {"modified": modified_parts, "created": created_parts}
