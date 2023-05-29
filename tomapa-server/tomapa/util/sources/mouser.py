import requests
import json

from flask import current_app

import time


def get_mouser_data(part_number):
    if part_number is None:
        return None

    headers = {"Content-Type": "application/json", "Accept": "application/json"}

    query = {"SearchByPartRequest": {"mouserPartNumber": part_number}}

    key = current_app.config.get("MOUSER_KEY", None)

    if key is None:
        return None

    parts = []

    time_before_request = time.time()
    search_req = requests.post(
        f"https://api.mouser.com/api/v1/search/partnumber?apiKey={key}",
        data=json.dumps(query),
        headers=headers,
    )
    time_after_request = time.time()

    # limit to < 30 requests a minute by making every request taking 2.1 seconds
    delay = 2.1 - (time_after_request - time_before_request)
    if delay > 0:
        time.sleep(delay)

    if search_req.status_code != 200:
        return None

    results = search_req.json()

    apiParts = results.get("SearchResults", {}).get("Parts", [])

    for part in apiParts:
        parts.append(part)

    part = None
    for p in parts:
        if p.get("MouserPartNumber", None) == part_number:
            part = p

    if part is not None:
        print(json.dumps(part, indent=2))
        output = {}
        properties = []
        datasheet = part.get("DataSheetUrl", None)
        if datasheet is not None:
            output.update({"datasheet": datasheet})
        description = part.get("Description", None)
        if description is not None:
            output.update({"description": description})
        image = part.get("ImagePath", None)
        if image is not None:
            output.update({"imageUrl": image})

        mfr = part.get("Manufacturer", None)
        if mfr is not None:
            properties.append(
                {
                    "name": "mfr",
                    "display_name": "Manufacturer",
                    "value": mfr,
                    "value_type": "str",
                }
            )

        mfr_no = part.get("ManufacturerPartNumber", None)
        if mfr_no is not None:
            properties.append(
                {
                    "name": "mfr_no",
                    "display_name": "Manufacturer Part #",
                    "value": mfr_no,
                    "value_type": "str",
                }
            )

        output.update({"properties": properties})

        return output

    return {}
