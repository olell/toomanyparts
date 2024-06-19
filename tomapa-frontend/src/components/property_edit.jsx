import { Col, Form, Button } from "react-bootstrap";
import { MinusCircle, CehckCircle, CheckCircle } from "react-feather";
import { useEffect, useState, useId } from "react";
import axios from "axios";
import { getApiEndpoint } from "../util/api";

const valueTypeInputElement = {
  str: "text",
  bool: "text",
  int: "number",
  float: "number",
};

const PropertyEdit = ({
  property,
  onChange = (p) => {},
  onDelete = (p) => {},
  onCheck = (p) => {},
  showCheck = false,
}) => {
  // Data retrieved from API
  const [units, setUnits] = useState();
  const [propertyTemplates, setPropertyTemplates] = useState();

  // Property values (for inputs)
  const [name, setName] = useState(property.name);
  const [displayName, setDisplayName] = useState(property.displayName);
  const [value, setValue] = useState(property.value);
  const [valueType, setValueType] = useState(property.value_type);
  const [unit, setUnit] = useState(property.unit);

  // result object, updated on blur
  var obj = {
    ...property,
    name: name,
    displayName: displayName,
    value: value,
    value_type: valueType,
    unit: unit,
  };

  // Identifier to be used by elements
  const elId = useId();

  // Update values when input object changes
  useEffect(() => {
    setName(property.name);
    setDisplayName(property.displayName);
    setValue(property.value);
    setValueType(property.value_type);
    setUnit(property.unit);
  }, [property]);

  // Load data from API
  useEffect(() => {
    axios.get(getApiEndpoint("/units")).then((result) => {
      if (result.status === 200) {
        setUnits(result.data.units);
      }
    });
    axios.get(getApiEndpoint("/properties/templates")).then((result) => {
      if (result.status === 200) {
        setPropertyTemplates(result.data.templates);
      }
    });
  }, []);

  // Checking for templates based on entered name
  useEffect(() => {
    propertyTemplates?.forEach((template) => {
      if (template.name === name) {
        setDisplayName(template.display_name);
        setUnit(template.unit?.id);
        setValueType(template.value_type);
      }
    });
  }, [name, propertyTemplates]);

  // Setting unit to 0 if valueType is str or bool
  useEffect(() => {
    if (valueType === "str" || valueType === "bool") setUnit(0);
  }, [valueType]);

  // "Auto-Detecting" type based on entered value
  useEffect(() => {
    if (valueType !== "str") {
      if (!isNaN(value) && value?.toString().indexOf(".") !== -1) {
        /* float */
        setValueType("float");
      } else if (!isNaN(value)) {
        /* int */
        setValueType("int");
      } else if (value === "true" || value === "false") {
        /* bool */
        setValueType("bool");
      } else {
        setValueType("str");
      }
    }
  }, [value, valueType]);

  // Called when an input is blurred "de-focused"
  const _onBlur = (e) => {
    obj = {
      ...obj,
      name: name,
      displayName: displayName,
      value: value,
      value_type: valueType,
      unit: unit,
    };
    onChange(obj);
  };

  return (
    <>
      <Col>
        {/* Name input */}
        <Form.Control
          type="text"
          value={name}
          list={`pni${elId}`}
          onChange={(e) => {
            setName(e.target.value);
          }}
          onBlur={_onBlur}
        />

        {/* Datalist containing recommendations from propertyTemplates */}
        <datalist id={`pni${elId}`}>
          {propertyTemplates?.map((t) => (
            <>
              <option value={t.name} />
            </>
          ))}
        </datalist>
      </Col>
      <Col>
        {/* Display Name Input*/}
        <Form.Control
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
          onBlur={_onBlur}
        />
      </Col>
      <Col>
        {/* Value Type Input*/}
        <Form.Select
          value={valueType}
          onChange={(e) => {
            setValueType(e.target.value);
          }}
          onBlur={_onBlur}
        >
          <option value="int">Int</option>
          <option value="float">Float</option>
          <option value="str">String</option>
          <option value="bool">Boolean</option>
        </Form.Select>
      </Col>
      <Col>
        {/* Value Input */}
        <Form.Control
          type={valueTypeInputElement[valueType]}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onBlur={_onBlur}
        />
      </Col>
      <Col>
        {/* Unit Input */}
        <Form.Select
          value={unit}
          disabled={valueType === "str" || valueType === "bool"}
          onChange={(e) => {
            setUnit(e.target.value);
          }}
          onBlur={_onBlur}
        >
          {/* Options mapped from units (retrieved from API) */}
          <option value="0">No Unit</option>
          {units?.map((unit) => (
            <option value={unit.id}>{unit.name}</option>
          ))}
        </Form.Select>
      </Col>
      <Col className="col-md-1">
        {showCheck ? (
          <>
            {/* Check Button, calling onCheck on click */}
            <Button
              variant="link"
              size="sm"
              className="text-success"
              onClick={(e) => {
                onCheck(obj);
              }}
            >
              <CheckCircle />
            </Button>
          </>
        ) : (
          <>
            {/* Delete Button, calling onDelete on call */}
            <Button
              variant="link"
              size="sm"
              className="text-danger"
              onClick={(e) => {
                onDelete(obj);
              }}
            >
              <MinusCircle />
            </Button>
          </>
        )}
      </Col>
    </>
  );
};

export default PropertyEdit;
