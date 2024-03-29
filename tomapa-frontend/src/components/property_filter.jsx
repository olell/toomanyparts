import { Container, ListGroup } from "react-bootstrap";

import { useState } from "react";

const PropertyFilter = ({ property, units, filter, setFilter, allValues }) => {
  const [selectedValues, setSelectedValues] = useState([]);

  const updateFilter = (selectedOptions) => {
    var new_filter = [];
    console.log(selectedOptions);
    for (let option of selectedOptions) {
      new_filter.push(option.value);
    }
    console.log(filter);
    setFilter({
      ...filter,
      [property.name]: {
        allowed_values: new_filter,
      },
    });
  };

  return (
    <>
      {!!units ? (
        <>
          <Container className="mb-3">
            <div style={{ whiteSpace: "nowrap" }}>{property.display_name}</div>
            <select
              class="form-select"
              multiple
              aria-label="multiple select example"
              size={6}
              onChange={(e) => {
                setSelectedValues([...e.target.selectedOptions]);
                updateFilter(e.target.selectedOptions);
              }}
            >
              {property.values
                .sort((a, b) => a[0] > b[0])
                .map((v) => (
                  <>
                    <option
                      value={v[0]}
                      selected={selectedValues?.indexOf(v[0]) !== -1}
                      className={
                        allValues.indexOf(v[0]) === -1
                          ? "text-muted"
                          : "text-body"
                      }
                    >
                      {v[2]}
                      {units[v[3] - 1]?.name}
                    </option>
                  </>
                ))}
            </select>
          </Container>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default PropertyFilter;
