export const generateDisplayName = (part) => {
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
