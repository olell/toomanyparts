from tomapa.models.parts import PartCategory


def get_categories_flat():
    categories = PartCategory.select()
    result = []
    for category in categories:
        result.append({
            "name": category.name,
            "parent": category.parent_id,
            "id": category.id,
            "children_count": sum([1 if x.parent_id == category.id else 0 for x in categories])
        })
    return result

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

