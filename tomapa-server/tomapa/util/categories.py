from tomapa.models.parts import PartCategory


def get_categories_flat():
    return [
        {
            "name": o.name,
            "parent": o.parent.id if o.parent is not None else None,
            "id": o.id,
            "children_count": len(o.children),
        }
        for o in PartCategory.select()
    ]


def get_categories_tree():
    objects = get_categories_flat()

    tree = {}
    object_dict = {obj["id"]: obj for obj in objects}

    for obj in objects:
        parent_id = obj["parent"]
        if parent_id is None:
            tree[obj["id"]] = obj
        else:
            parent_obj = object_dict[parent_id]
            if "children" not in parent_obj:
                parent_obj["children"] = []
            parent_obj["children"].append(obj)

    return tree


def is_part_in_child_category(part, category):
    if part.category == category:
        return True

    for child in category.children:
        if is_part_in_child_category(part, child):
            return True

    return False
