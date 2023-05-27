import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, ListGroup, Row } from "react-bootstrap";
import { MinusCircle, PlusCircle } from "react-feather";

function valueTypeInputElement(property: any) {
  if (property.value_type == "str") return "text";
  if (property.value_type == "bool") return "text";
  if (property.value_type == "int") return "number";
  if (property.value_type == "float") return "number";
}

const CreatePart = () => {
  const [categories, setCategories] = useState<any>();
  const [locations, setLocations] = useState<any>();
  const [units, setUnits] = useState<any>();
  const [propertyTemplates, setPropertyTemplates] = useState<any>();

  const [location, setLocation] = useState(1);
  const [category, setCategory] = useState(1);
  const [properties, setProperties] = useState<any>([]);

  const commonPartProperties = ["mfr", "mfr_no", "package"];

  useEffect(() => {
    axios.get("http://localhost:3279/categories?flat").then((result: any) => {
      if (result.status === 200) {
        setCategories(result.data.categories);
      }
    });
    axios.get("http://localhost:3279/storelocations").then((result: any) => {
      if (result.status === 200) {
        setLocations(result.data.storage_locations);
      }
    });
    axios.get("http://localhost:3279/units").then((result: any) => {
      if (result.status === 200) {
        setUnits(result.data.units);
      }
    });
    axios
      .get("http://localhost:3279/properties/templates")
      .then((result: any) => {
        if (result.status === 200) {
          setPropertyTemplates(result.data.templates);
        }
      });
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:3279/properties?category=${category}`)
      .then((result: any) => {
        if (result.status === 200) {
          let newProperties: any = [];
          let suggestedProperties = [
            ...commonPartProperties,
            ...result.data.properties,
          ];
          suggestedProperties.forEach((property: any) => {
            let propertyTemplate = {};
            propertyTemplates?.forEach((template: any) => {
              if (template.name == property) {
                propertyTemplate = template;
              }
            });
            console.log(propertyTemplates, propertyTemplate, property);
            if (
              "name" in propertyTemplate &&
              "display_name" in propertyTemplate &&
              "unit" in propertyTemplate
            ) {
              newProperties.push({
                name: propertyTemplate.name,
                display_name: propertyTemplate.display_name,
                unit: propertyTemplate.unit,
              });
            }
          });
          setProperties(newProperties);
        }
      });
  }, [category]);

  return (
    <>
      <h1>New Part!</h1>
      <hr></hr>
      <Form.Group>
        <Form.Label>Part Category</Form.Label>
        <Form.Select
          onChange={(event: any) => {
            setCategory(event.target.value);
          }}
        >
          {categories?.map((el: any) =>
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
          onChange={(event: any) => {
            setLocation(event.target.value);
          }}
        >
          {locations?.map((el: any) => (
            <option value={el.id}>{el.name}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mt-1">
        <Form.Label>Part Description</Form.Label>
        <Form.Control type="text" />
      </Form.Group>
      <Form.Group className="mt-1">
        <Form.Label>Stock</Form.Label>
        <Form.Control type="number" min="0" />
      </Form.Group>
      <div className="mt-3">Part Properties</div>
      {properties.map((property: any) => (
        <Row className="d-flex">
          <Col>
            <Form.Control
              type="text"
              defaultValue={property?.name}
              onChange={(e: any) => {
                property.name = e.target.value;
              }}
            />
          </Col>
          <Col>
            <Form.Control
              type="text"
              defaultValue={property?.display_name}
              onChange={(e: any) => {
                property.display_name = e.target.value;
              }}
            />
          </Col>
          <Col>
            <Form.Control
              type={valueTypeInputElement(property)}
              defaultValue={property?.value}
              onChange={(e: any) => {
                property.value = e.target.value;
                console.log(properties);
              }}
            />
          </Col>
          <Col>
            <Form.Select>
              <option
                value="0"
                onSelect={() => {
                  property.unit = null;
                }}
              >
                No Unit
              </option>
              {units?.map((unit: any) => (
                <option value={unit.id} selected={unit?.id == property?.unit}>
                  {unit?.name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col className="col-md-1">
            <Button
              variant="link"
              size="sm"
              className="text-danger"
              onClick={(e: any) => {
                let newProperties: any[] = [];
                properties.forEach((prop: any) => {
                  if (prop.name !== property.name) {
                    newProperties.push(prop);
                  }
                });
                console.log(newProperties);
                setProperties(newProperties);
              }}
            >
              <MinusCircle />
            </Button>
          </Col>
        </Row>
      ))}
      <Row>
        <Col>
          <Button
            variant="link"
            size="sm"
            className="text-success float-start me-3"
            onClick={(e: any) => {
              setProperties([
                ...properties,
                {
                  name: `property_${properties.length + 1}`,
                  value: null,
                  unit: null,
                  display_name: "",
                },
              ]);
            }}
          >
            <PlusCircle />
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default CreatePart;
