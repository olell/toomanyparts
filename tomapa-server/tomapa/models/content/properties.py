from tomapa.models.parts import PropertyTemplate, Unit


def create_property_template_model(name, display_name, value_type, unit):
    template = PropertyTemplate.get_or_none(PropertyTemplate.name == name)

    if template is not None:
        return template

    unit_model = Unit.get_or_none(Unit.name == unit)

    template = PropertyTemplate(
        name=name,
        display_name=display_name,
        value_type=value_type.__name__,
        unit=unit_model,
    )
    template.save(1)


def create_property_templates():
    data = [
        # Misc
        ("mfr", "Manufacturer", str, None),
        ("mfr_no", "Manufacturer Part #", str, None),
        ("src", "Source", str, None),
        ("src_no", "Source Part #", str, None),
        ("custom_no", "Custom Part #", str, None),
        ("package", "Package", str, None),
        ("rohs", "RoHS Compatible", bool, None),
        ("datasheet_url", "Datasheet URL", str, None),
        # Specific value types
        ("c", "Capacitance", float, "F"),
        ("r", "Resistance", float, "Ω"),
        ("l", "Inductance", float, "H"),
        ("v", "Voltage", float, "V"),
        ("p", "Power", float, "W"),
        ("f", "Frequency", float, "Hz"),
        ("capacity", "Capacity", float, "Ah"),
        ("amp", "Current", float, "A"),
        # Other value attributes
        ("v_in", "Input Voltage", float, "V"),
        ("v_out", "Output Voltage", float, "V"),
        ("v_min", "Min. Voltage", float, "V"),
        ("v_max", "Max. Voltage", float, "V"),
        ("p_min", "Min. Power", float, "W"),
        ("p_max", "Max. Power", float, "W"),
        ("amp_min", "Min. Current", float, "A"),
        ("amp_max", "Max. Current", float, "A"),
        ("t_min", "Min. Temperature", float, "°C"),
        ("t_max", "Max. Temperature", float, "°C"),
        ("f_min", "Min. Frequency", float, "Hz"),
        ("f_max", "Min. Frequency", float, "Hz"),
        ("tcc", "Temperature Coefficient", str, None),
        ("min_stock", "Minimum Stock", int, None),
    ]

    for row in data:
        create_property_template_model(*row)
