import { Col, Form, Button } from "react-bootstrap";
import { MinusCircle } from "react-feather";
import { useEffect, useState, useId } from "react";
import axios from "axios";

const valueTypeInputElement = {
  str: "text",
  bool: "text",
  int: "number",
  float: "number",
};

const PropertyEdit = ({ property, onChange = (p) => {} }) => {
  const [units, setUnits] = useState();
  const [propertyTemplates, setPropertyTemplates] = useState();

  const [name, setName] = useState(property.name);
  const [displayName, setDisplayName] = useState(property.display_name);
  const [value, setValue] = useState(property.value);
  const [valueType, setValueType] = useState(property.value_type);
  const [unit, setUnit] = useState(property.unit);

  const [isDeleted, setDeleted] = useState(!!property.isDeleted);

  const elId = useId();

  useEffect(() => {
    axios.get("http://localhost:3279/units").then((result) => {
      if (result.status === 200) {
        setUnits(result.data.units);
      }
    });
    axios.get("http://localhost:3279/properties/templates").then((result) => {
      if (result.status === 200) {
        setPropertyTemplates(result.data.templates);
      }
    });
  }, []);

  useEffect(() => {
    propertyTemplates?.forEach((template) => {
      if (template.name == name) {
        setDisplayName(template.display_name);
        setUnit(template.unit?.id);
        setValueType(template.value_type);
      }
    });
  }, [name]);

  useEffect(() => {
    if (valueType == "str" || valueType == "bool") setUnit(0);
  }, [valueType, unit]);

  useEffect(() => {
    if (valueType != "str") {
      if (!isNaN(value) && value?.toString().indexOf(".") != -1) {
        /* float */
        setValueType("float");
      } else if (!isNaN(value)) {
        /* int */
        setValueType("int");
      } else if (value == "true" || value == "false") {
        /* bool */
        setValueType("bool");
      } else {
        setValueType("str");
      }
    }
  }, [value]);

  useEffect(() => {
    onChange({
      name: name,
      display_name: displayName,
      value: value,
      valueType: valueType,
      unit: unit,
    });
  }, [name, displayName, value, valueType, unit]);

  return isDeleted ? (
    <></>
  ) : (
    <>
      <Col>
        <Form.Control
          type="text"
          value={name}
          list={`pni${elId}`}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <datalist id={`pni${elId}`}>
          {propertyTemplates?.map((t) => (
            <>
              <option value={t.name} />
            </>
          ))}
        </datalist>
      </Col>
      <Col>
        <Form.Control
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
        />
      </Col>
      <Col>
        <Form.Select
          value={valueType}
          onChange={(e) => {
            setValueType(e.target.value);
          }}
        >
          <option value="int">Int</option>
          <option value="float">Float</option>
          <option value="str">String</option>
          <option value="bool">Boolean</option>
        </Form.Select>
      </Col>
      <Col>
        <Form.Control
          type={valueTypeInputElement[valueType]}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </Col>
      <Col>
        <Form.Select
          value={unit}
          disabled={valueType == "str" || valueType == "bool"}
          onChange={(e) => {
            setUnit(e.target.value);
          }}
        >
          <option value="0">No Unit</option>
          {units?.map((unit) => (
            <option value={unit.id}>{unit.name}</option>
          ))}
        </Form.Select>
      </Col>
      <Col className="col-md-1">
        <Button
          variant="link"
          size="sm"
          className="text-danger"
          onClick={(e) => {
            setDeleted(true);
            onChange({ isDeleted: true });
          }}
        >
          <MinusCircle />
        </Button>
      </Col>
    </>
  );
};

export default PropertyEdit;
