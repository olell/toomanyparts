def parse_footprint_report(text):
    result = {}
    x0 = y0 = x1 = y1 = -1
    current_section = ""
    current_module = ""
    for line in text.split("\n"):
        if line == "$BOARD":
            current_section = "BOARD"
        if line.startswith("$MODULE"):
            current_section = "MODULE"
            _, current_module = line.split()

        if current_section == "BOARD":
            if line.startswith("upper_left_corner"):
                _, x0s, y0s = line.split()
                try:
                    x0 = float(x0s)
                    y0 = float(y0s)
                except ValueError:
                    x0 = -1
                    y0 = -1
            if line.startswith("lower_right_corner"):
                _, x1s, y1s = line.split()
                try:
                    x1 = float(x1s)
                    y1 = float(y1s)
                except ValueError:
                    x1 = -1
                    y1 = -1

        if current_section == "MODULE":
            module_data = result.get(current_module, {})
            if line.startswith("position"):
                _, xs, ys, _, _ = line.split()
                try:
                    x = (float(xs) - x0) / (x1 - x0)
                    y = (float(ys) - y0) / (y1 - y0)
                except ValueError:
                    x = y = -1
                module_data.update({"x": x, "y": y})
                result.update({current_module: module_data})
                current_section = ""

    return result


if __name__ == "__main__":
    import sys

    with open(sys.argv[1], "r") as target:
        result = parse_footprint_report(target.read())
        print(result)
