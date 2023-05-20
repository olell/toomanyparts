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
            field.smaller_div = factor
        if i < len(fields) - 1:
            field.bigger = fields[i + 1][0]
            field.bigger_mul = factor
        field.save()


def create_units():
    create_unit_models("mΩ", "Ω", "kΩ", "MΩ", base="Ω")
    create_unit_models("pF", "nF", "uF", "mF", "F", base="F")
    create_unit_models("nH", "uH", "mH", "H", base="H")
    create_unit_models("mV", "V", "kV", base="V")
    create_unit_models("Hz", "kHz", "MHz", "GHz", base="Hz")
