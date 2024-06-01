import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Spinner, Form, Container, Row } from "react-bootstrap";
import { PlusCircle } from "react-feather";
import { useNavigate } from "react-router-dom";

import PropertyEdit from "../components/property_edit";
import AddLocationModal from "../components/location_add";
import { getApiEndpoint } from "../util/api";
import { makeid } from "../util/property";

const propTypeDefaultValues = {
  str: "",
  bool: "false",
  int: 1,
  float: "0.0",
};

const CreatePart = ({ setPartsChanged }) => {
  const navigate = useNavigate();

  // Data retrieved from API
  const [categories, setCategories] = useState();
  const [locations, setLocations] = useState();
  const [propertyTemplates, setPropertyTemplates] = useState();

  // Data inputs
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(0);
  const [location, setLocation] = useState(null);
  const [category, setCategory] = useState(null);

  // Properties object
  // key is a unique id, value is the property object
  const [properties, setProperties] = useState({});

  // Image and datasheet url, only to be set by source autoloading
  const [imageUrl, setImageUrl] = useState(null);
  const [datasheetUrl, setDatasheetUrl] = useState(null);

  // LocationAddModal, isSaving for loading spinner, has already loaded smth from source
  const [showAddLocationModal, setShowAddLocation] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [loadedSource, setLoadedSource] = useState(false);

  // Always added properties (more data from templates)
  const commonPartProperties = ["src", "src_no", "mfr", "mfr_no", "package"];

  // Part result object (as it will be send to the API)
  const [resultObject, setResultObject] = useState({});

  // Helper functions
  const createPart = () => {
    // Send the API request to create a Part
    console.log("result", resultObject);
    axios
      .post(getApiEndpoint("/part"), resultObject, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((result) => {
        if (result.status === 200) {
          navigate(`/part/${result.data.id}`);
          setPartsChanged(Date.now());
        }
      })
      .catch((e) => {
        console.log("e", e);
      });
  };

  const getPropertyById = (id, data) => {
    /* Returns a property from the list by the ID */
    return Object.keys(data).indexOf(id) != -1 ? data[id] : null;
  };

  const getPropertyByName = (name, data) => {
    /* Returns a property from the list by the name */
    let result = null;
    Object.values(data).forEach((el) => {
      if (el.name === name) result = el;
    });
    return result;
  };

  const getPropertyTemplateByName = (name) => {
    /* Returns a property template by the name */
    let result = null;
    if (!!propertyTemplates) {
      propertyTemplates.forEach((el) => {
        if (el.name === name) result = el;
      });
    }
    return result;
  };

  /* Checking if src and src_no properties are set for the first time
   * and requesting source properties from API */
  useEffect(() => {
    let src = getPropertyByName("src", properties);
    let src_no = getPropertyByName("src_no", properties);

    if (!!src?.value && !!src_no?.value && !loadedSource) {
      console.log(src, src_no);
      setLoadedSource(true);
      axios
        .get(getApiEndpoint(`/source?src=${src.value}&src_no=${src_no.value}`))
        .then((result) => {
          if (result.status === 200) {
            setDescription(result.data.description);
            setDatasheetUrl(result.data.datasheet);
            setImageUrl(result.data.imageUrl);

            let updatedProps = {};

            result.data.properties.forEach((p) => {
              let existing = getPropertyByName(p.name, properties);
              if (!!!existing) {
                existing = { id: makeid() };
              }
              existing = {
                ...existing,
                name: p.name,
                displayName: p.display_name,
                value: p.value,
                value_type: p.value_type,
                unit: p.unit,
              };
              updatedProps[existing.id] = existing;
            });

            setProperties({ ...properties, ...updatedProps });
          }
        })
        .catch(() => {});
    }
  }, [resultObject]);

  /* Load data from API */
  useEffect(() => {
    axios.get(getApiEndpoint("/categories?flat")).then((result) => {
      if (result.status === 200) {
        setCategories(result.data.categories);
      }
    });
    axios.get(getApiEndpoint("/storelocations")).then((result) => {
      if (result.status === 200) {
        setLocations(result.data.storage_locations);
      }
    });
    axios.get(getApiEndpoint("/properties/templates")).then((result) => {
      if (result.status === 200) {
        setPropertyTemplates(result.data.templates);
      }
    });
  }, []);

  /* Load properties based on selected part category */
  useEffect(() => {
    axios
      .get(getApiEndpoint(`/properties?category=${category}`))
      .then((result) => {
        if (result.status === 200) {
          // Suggested property names (commonPartProperties + common properties in category)
          let suggestedProperties = [
            ...commonPartProperties,
            ...Object.keys(result.data.properties),
          ];
          let propertiesToAdd = {};
          suggestedProperties.forEach((propertyName) => {
            let propertyTemplate = getPropertyTemplateByName(propertyName);

            if (
              !!propertyTemplate &&
              !!!getPropertyByName(propertyName, properties) && // not in properties
              !!!getPropertyByName(propertyName, propertiesToAdd) // not in propertiesToAdd
            ) {
              // There is such a template, but not already a property with the name

              let newProperty = {
                name: propertyTemplate.name,
                displayName: propertyTemplate.display_name,
                value: propTypeDefaultValues[propertyTemplate.value_type],
                value_type: propertyTemplate.value_type,
                unit: propertyTemplate.unit?.id,
                id: makeid(),
              };
              // Adding property
              propertiesToAdd = {
                ...propertiesToAdd,
                [newProperty.id]: newProperty,
              };
            }
          });
          console.log("adding props", propertiesToAdd, "to", properties);
          setProperties({ ...properties, ...propertiesToAdd });
        }
      })
      .catch(() => {});
  }, [category]);

  useEffect(() => {
    /* Creating result object */
    let result = {};
    result["stock"] = stock;
    result["category"] = category;
    result["location"] = location;
    if (!!imageUrl) {
      result["image_url"] = imageUrl;
    }
    if (!!datasheetUrl) {
      result["datasheet_url"] = datasheetUrl;
    }
    result["description"] = description;
    result["properties"] = Object.values(properties)
      .filter((p) => p.value !== null && p.value !== undefined)
      .map((p) => ({
        name: !!p.name ? p.name : undefined,
        display_name: !!p.displayName ? p.displayName : undefined,
        value: p.value.toString(),
        value_type: !!p.value_type ? p.value_type.toString() : undefined,
        unit: !!p.unit ? p.unit : undefined,
      }));
    setResultObject(result);
    console.log("current result object", result);
  }, [stock, properties, category, location, description]);

  return (
    <>
      <h1>New Part!</h1>
      <hr></hr>
      {isSaving ? (
        <>
          <Container className="d-flex mt-5 justify-content-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Container>
        </>
      ) : (
        <>
          <Form.Group>
            <Form.Label>Part Category</Form.Label>
            <Form.Select
              onChange={(event) => {
                setCategory(event.target.value);
              }}
            >
              <option value="0">Please select a Category!</option>
              {categories?.map((el) =>
                el.children_count == 0 ? (
                  <option value={el.id}>{el.name}</option>
                ) : (
                  <></>
                )
              )}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mt-1">
            <Form.Label>
              Storage Location
              <Button
                variant="link"
                size="sm"
                className="text-success"
                onClick={() => {
                  setShowAddLocation(true);
                }}
              >
                <PlusCircle />
              </Button>
            </Form.Label>
            <Form.Select
              onChange={(event) => {
                setLocation(event.target.value);
              }}
            >
              {locations?.map((el) => (
                <option value={el.id}>{el.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <AddLocationModal
            show={showAddLocationModal}
            setShow={setShowAddLocation}
            onAdd={(id) => {
              axios.get(getApiEndpoint("/storelocations")).then((result) => {
                if (result.status === 200) {
                  setLocations(result.data.storage_locations);
                }
              });
            }}
          />

          <Form.Group className="mt-1">
            <Form.Label>Part Description</Form.Label>
            <Form.Control
              type="text"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mt-1">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              min="0"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
              }}
            />
          </Form.Group>
          <div className="mt-3">
            Part Properties
            <Button
              variant="link"
              size="sm"
              className="text-success"
              onClick={(e) => {
                let newPropId = makeid();
                setProperties({
                  ...properties,
                  [newPropId]: {
                    name: `property_${Object.keys(properties).length + 1}`,
                    value: "",
                    value_type: "str",
                    unit: 0,
                    displayName: "",
                    id: newPropId,
                  },
                });
              }}
            >
              <PlusCircle />
            </Button>
          </div>
          <div>
            <Row className="d-flex">
              <Col>Name</Col>
              <Col>Display Name</Col>
              <Col>Type</Col>
              <Col>Value</Col>
              <Col>Unit</Col>
              <Col className="col-md-1">Delete</Col>
            </Row>
            {Object.values(properties).map((property) => (
              <Row className="d-flex">
                <PropertyEdit
                  property={property}
                  onChange={(p) => {
                    setProperties({
                      ...properties,
                      [p.id]: p,
                    });
                  }}
                  onDelete={(e) => {
                    var ptmp = { ...properties }; // Copy
                    delete ptmp[e.id]; // Remove
                    setProperties(ptmp); // Set
                  }}
                />
              </Row>
            ))}
          </div>
          <Row className="mt-3">
            <Col>
              <Button
                className="float-end"
                onClick={() => {
                  setSaving(true);
                  createPart();
                }}
              >
                Create Part!
              </Button>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default CreatePart;
