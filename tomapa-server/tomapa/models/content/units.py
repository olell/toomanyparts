from tomapa.models.parts import Unit


def create_unit_models(*names, base=None, factor=1000):
    fields = []
    base_model = None
    for name in names:
        fields.append(Unit.get_or_create(name=name))
        if name == base:
            base_model = fields[-1][0]
    for i in range(0, len(fields)):
        field, _ = fields[i]
        if base_model is not None:
            field.base = base_model
        if i > 0:
            field.smaller = fields[i - 1][0]
            field.smaller_mul = factor
        if i < len(fields) - 1:
            field.bigger = fields[i + 1][0]
            field.bigger_div = factor
        field.save()


def create_units():
    create_unit_models("mΩ", "Ω", "kΩ", "MΩ", base="mΩ")
    create_unit_models("pF", "nF", "uF", "mF", "F", base="pF")
    create_unit_models("nH", "uH", "mH", "H", base="nH")
    create_unit_models("mV", "V", "kV", base="mV")
    create_unit_models("Hz", "kHz", "MHz", "GHz", base="Hz")
    create_unit_models("mW", "W", "kW", base="mW")
    create_unit_models("°C", base="°C")
    create_unit_models("mAh", "Ah", base="mAh")
    create_unit_models("uA", "mA", "A", base="nA")
