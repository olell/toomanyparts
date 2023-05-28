import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Spinner, Form, Container, Row } from "react-bootstrap";
import { MinusCircle, PlusCircle } from "react-feather";
import PropertyEdit from "../components/property_edit";
import { useNavigate } from "react-router-dom";

const propTypeDefaultValues = {
  str: " ",
  bool: "false",
  int: 1,
  float: "0.0",
};

const CreatePart = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState();
  const [locations, setLocations] = useState();
  const [propertyTemplates, setPropertyTemplates] = useState();

  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(0);
  const [location, setLocation] = useState(1);
  const [category, setCategory] = useState(1);
  const [properties, setProperties] = useState({});

  const [isSaving, setSaving] = useState(false);

  const commonPartProperties = ["mfr", "mfr_no", "src", "src_no", "package"];

  const [resultObject, setResultObject] = useState({});

  const createPart = () => {
    console.log(resultObject);
    axios
      .post("http://localhost:3279/part", resultObject, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((result) => {
        if (result.status === 200) {
          console.log(result);
          navigate(`/part/${result.data.id}`);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    axios.get("http://localhost:3279/categories?flat").then((result) => {
      if (result.status === 200) {
        setCategories(result.data.categories);
      }
    });
    axios.get("http://localhost:3279/storelocations").then((result) => {
      if (result.status === 200) {
        setLocations(result.data.storage_locations);
      }
    });
    axios.get("http://localhost:3279/properties/templates").then((result) => {
      if (result.status === 200) {
        setPropertyTemplates(result.data.templates);
      }
    });
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:3279/properties?category=${category}`)
      .then((result) => {
        if (result.status === 200) {
          let newProperties = {};
          let suggestedProperties = [
            ...commonPartProperties,
            ...result.data.properties,
          ];
          suggestedProperties.forEach((property) => {
            let propertyTemplate = {};
            propertyTemplates?.forEach((template) => {
              if (template.name == property) {
                propertyTemplate = template;
              }
            });
            console.log(propertyTemplate, "name" in propertyTemplate);
            if ("name" in propertyTemplate) {
              let n = {
                name: propertyTemplate.name,
                display_name: propertyTemplate.display_name,
                value: propTypeDefaultValues[propertyTemplate.value_type],
                value_type: propertyTemplate.value_type,
                unit: propertyTemplate.unit?.id,
              };
              newProperties[n.name] = n;
            }
          });
          setProperties({
            ...properties,
            ...newProperties,
          });
        }
      });
  }, [category]);

  useEffect(() => {
    console.log("Properties changed", properties);

    resultObject["stock"] = stock;
    resultObject["category"] = category;
    resultObject["location"] = location;
    resultObject["description"] = description;
    resultObject["properties"] = Object.values(properties)
      .filter((p) => !p.isDeleted)
      .map((p) => ({
        name: p.name,
        display_name: p.display_name,
        value: p.value,
        value_type: p.valueType,
        unit: p.unit > 0 ? p.unit : undefined,
      }));
  }, [stock, properties]);

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
            <Form.Label>Storage Location</Form.Label>
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
                setProperties({
                  ...properties,
                  [`property_${Object.keys(properties).length + 1}`]: {
                    name: `property_${Object.keys(properties).length + 1}`,
                    value: null,
                    unit: null,
                    display_name: "",
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
            {Object.keys(properties).map((property, idx) => (
              <Row className="d-flex">
                <PropertyEdit
                  property={properties[property]}
                  onChange={(p) => {
                    console.log("changed", idx, p, properties);
                    setProperties({
                      ...properties,
                      [property]: p,
                    });
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