from blabel import LabelWriter
from tomapa.util.units import get_human_readable

import os


def generate_label(part, path):
    p = os.path.abspath(__file__)
    css_path = os.path.join(os.path.split(p)[0], "labeldata/label_style.css")
    html_path = os.path.join(os.path.split(p)[0], "labeldata/label_template.html")

    label_writer = LabelWriter(
        html_path,
        default_stylesheets=(css_path,),
    )

    part_data = {
        "qr_text": f"part#id={part.id}",
        "id": part.id,
        "description": part.description,
        "stock": part.stock,
    }

    for prop in part.properties:
        value = prop.get_value()
        if prop.unit is not None:
            value, unit = get_human_readable(value, prop.unit)
            value = str(value) + unit.name
        part_data.update({prop.name: value})

    label_writer.write_labels([part_data], target=path)
