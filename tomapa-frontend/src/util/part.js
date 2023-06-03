import { getApiEndpoint } from "./api";

export const generateDisplayName = (part) => {
  /**
   * Generates a display name. Uses Manufacturer and Mfr. Part Number or
   * if thats not available the part description.
   */
  let mfr_no = null;
  let mfr = null;
  if (part.properties.length > 0) {
    for (let i = 0; i < part.properties.length; i++) {
      if (part.properties[i].name == "mfr_no") {
        mfr_no = part.properties[i].value;
      }
      if (part.properties[i].name == "mfr") {
        mfr = part.properties[i].value;
      }
    }
  }
  if (mfr_no !== null && mfr !== null) {
    return mfr + " " + mfr_no;
  }
  if (mfr_no !== null) {
    return mfr_no;
  }
  return part.description;
};

export const getPartDocsByType = (part, type = "image") => {
  /**
   * Returns all docs from a part with the specified type
   *
   * @param part Part object containing a list of docs
   * @param type Type to filter ("image" for image, "datasheet" for datasheets, etc.)
   */
  let images = [];
  if (!!part.docs) {
    part.docs.forEach((el) => {
      if (el.type == type) images.push(el);
    });
  }
};

export const getDocUrl = (doc) => {
  /**
   * Returns the url to the content of a doc
   *
   * @param doc Doc object
   */
  return getApiEndpoint(`/doc?id=${doc.id}`);
};

export const getImageUrl = (part) => {
  // Returns the url of the first found image
  let result = "";
  part.docs.forEach((doc) => {
    if (doc.type === "image" && !!!result) {
      result = getDocUrl(doc);
    }
  });
  return result;
};
