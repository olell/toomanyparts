import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Form, ListGroup, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle,
  Edit2,
  FileText,
  MinusCircle,
  PlusCircle,
  Save,
  Trash2,
} from "react-feather";

import { generateDisplayName } from "../util/stringen";

function propertyValueRepresentation(property) {
  if (property.value_type == "str") return property.value;

  if (property.value_type == "bool") return property.value ? "Yes" : "No";

  if (property.hr_value !== undefined) {
    return `${property.hr_value} ${property.hr_unit.name}`;
  } else if (property.unit) {
    return `${property.value} ${property.unit.name}`;
  } else {
    return `${property.value}`;
  }
  return "";
}

function valueTypeInputElement(property) {
  if (property.value_type == "str") return "text";
  if (property.value_type == "bool") return "text";
  if (property.value_type == "int") return "number";
  if (property.value_type == "float") return "number";
}

const PartView = () => {
  const { id } = useParams();
  const [part, setPart] = useState(null);
  const [categoryPath, setCategoryPath] = useState();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState();
  const [heading, setHeading] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [categories, setCategories] = useState();
  const [locations, setLocations] = useState();
  const [units, setUnits] = useState();

  const updatePart = (attributes) => {
    let data = {
      id: part.id,
      ...attributes,
    };
    axios.put("http://localhost:3279/part", data).then((response) => {
      if (response.status === 200) {
        setPart(response.data);
      }
    });
  };
  const updateProperty = (property, attributes) => {
    let data = {
      id: property.id,
      ...attributes,
    };
    axios.put("http://localhost:3279/part/property", data).then((response) => {
      if (response.status === 200) {
        axios
          .get("http://localhost:3279/part", { params: { id: id } })
          .then((response) => {
            if (response.status === 200) {
              setPart(response.data);
            }
          });
      }
    });
  };
  const deleteProperty = (property) => {
    let data = {
      id: property.id,
    };
    axios
      .delete("http://localhost:3279/part/property", { data: data })
      .then((response) => {
        if (response.status === 204) {
          axios
            .get("http://localhost:3279/part", { params: { id: id } })
            .then((response) => {
              if (response.status === 200) {
                setPart(response.data);
              }
            });
        }
      });
  };
  const uploadFile = (file, doctype) => {
    var data = new FormData();
    data.append("file", file);
    data.append("part", part?.id);
    data.append("type", doctype);
    axios
      .post("http://localhost:3279/doc", data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        loadPartData();
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
    axios.get("http://localhost:3279/units").then((result) => {
      if (result.status === 200) {
        setUnits(result.data.units);
      }
    });
  }, [editMode]);

  const loadPartData = () => {
    axios
      .get("http://localhost:3279/part", { params: { id: id } })
      .then((response) => {
        if (response.status === 200) {
          setPart(response.data);
        }
      });
  };

  useEffect(() => {
    loadPartData();
  }, [id]);

  useEffect(() => {
    let cat = part?.category;
    let path = [];
    do {
      path.push(cat);
      cat = cat?.parent;
    } while (cat);
    setCategoryPath(path.reverse());

    if (part?.docs.length > 0) {
      for (let i = 0; i < part?.docs.length; i++) {
        if (part?.docs[i].type == "image") {
          setSelectedImage(part?.docs[i].id);
          break;
        }
      }
    }

    if (part) setHeading(generateDisplayName(part));
  }, [part]);

  return (
    <>
      <h1>{heading}</h1>
      {heading !== part?.description ? <span>{part?.description}</span> : <></>}
      <Button
        variant="link"
        size="sm"
        className="text-info float-end"
        onClick={() => {
          setEditMode(!editMode);
        }}
      >
        {editMode ? <CheckCircle /> : <Edit2 />}
      </Button>
      <Button
        variant="link"
        size="sm"
        className="text-danger float-end"
        onClick={() => {}}
      >
        <Trash2 />
      </Button>
      <hr></hr>
      <Row>
        {/* Category Path */}
        {editMode ? (
          <>
            <Form.Select
              onChange={(event) => {
                updatePart({ category: event.target.value });
              }}
            >
              {categories?.map((category) =>
                category.children_count == 0 ? (
                  /*Show only categories at end of the tree*/ <>
                    <option
                      value={category.id}
                      selected={category?.id == part?.category.id}
                    >
                      {category.name}
                    </option>
                  </>
                ) : (
                  <></>
                )
              )}
            </Form.Select>
          </>
        ) : (
          <>
            <Col>
              {categoryPath?.map((el) => (
                <>
                  <a
                    href="javascript:null"
                    onClick={() => {
                      navigate(`/category/${el?.id}`);
                    }}
                  >
                    {el?.name}
                  </a>
                  {el?.children?.length > 0 ? " / " : " "}
                </>
              ))}
            </Col>
          </>
        )}
      </Row>
      <Row className="mt-4">
        {/* Image Preview */}
        <Col className="col-md-3">
          <Row>
            {selectedImage !== undefined ? (
              <img
                className="part-image"
                src={`http://localhost:3279/doc?id=${selectedImage}`}
              ></img>
            ) : (
              <>
                <img
                  className="part-image"
                  src="http://localhost:3279/static/no_image.png"
                ></img>
              </>
            )}
          </Row>
          <Row className="d-flex justify-content-around">
            {part?.docs.map((doc) =>
              doc.type === "image" ? (
                <>
                  <div
                    className="part-image-thumb-container mt-2"
                    onClick={() => {
                      setSelectedImage(doc.id);
                    }}
                  >
                    <img
                      className="part-image-thumb"
                      src={`http://localhost:3279/doc?id=${doc.id}`}
                    ></img>
                  </div>
                </>
              ) : (
                <></>
              )
            )}
          </Row>
          {editMode ? (
            <>
              <Form.Group controlId="formFile" className="mt-3">
                <Form.Label>Add Image</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => {
                    if (e.target.files.length == 1) {
                      uploadFile(e.target.files[0], "image");
                    }
                  }}
                />
              </Form.Group>
            </>
          ) : (
            <></>
          )}
        </Col>
        {/* Properties */}
        <Col>
          <Table>
            <tbody>
              <tr>
                <td className="property-table-name fw-bold">
                  Stock
                  {editMode ? (
                    <></>
                  ) : (
                    <>
                      <Button
                        variant="link"
                        size="sm"
                        className="ms-3 text-success"
                        onClick={() => {
                          updatePart({ stock: part.stock + 1 });
                        }}
                      >
                        <PlusCircle />
                      </Button>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger"
                        onClick={() => {
                          updatePart({ stock: part.stock - 1 });
                        }}
                      >
                        <MinusCircle />
                      </Button>
                    </>
                  )}
                </td>
                <td className="property-table-value">
                  {editMode ? (
                    <>
                      <Form.Control
                        type="number"
                        defaultValue={part?.stock}
                        onBlur={(event) => {
                          if (!!event.target.value) {
                            updatePart({ stock: event.target.value });
                          }
                        }}
                      />
                    </>
                  ) : (
                    <>{part?.stock}</>
                  )}
                </td>
              </tr>
              <tr className="mb-2">
                <td className="property-table-name fw-bold">Location</td>
                <td className="property-table-value">
                  {editMode ? (
                    <>
                      <Form.Select
                        onChange={(event) => {
                          updatePart({ location: event.target.value });
                        }}
                      >
                        {locations?.map((location) => (
                          <option
                            value={location.id}
                            selected={location?.id == part?.location.id}
                          >
                            {location.name}
                          </option>
                        ))}
                      </Form.Select>
                    </>
                  ) : (
                    <>{part?.location.name}</>
                  )}
                </td>
              </tr>
              {part?.properties
                .sort((a, b) =>
                  a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                )
                .map((property) =>
                  editMode ? (
                    <tr>
                      <td className="property-table-name fw-bold">PROPERTY</td>
                      <td className="property-table-value d-flex">
                        <Form.Control
                          type="text"
                          defaultValue={property?.name}
                          disabled
                        />
                        <Form.Control
                          type="text"
                          defaultValue={property?.display_name}
                          disabled
                        />
                        <Form.Control
                          type={valueTypeInputElement(property)}
                          defaultValue={property?.value}
                          onBlur={(event) => {
                            updateProperty(property, {
                              value: event.target.value,
                              value_type: property.value_type,
                            });
                          }}
                        />
                        {!!property?.unit ? (
                          <Form.Select disabled>
                            {units?.map((unit) => (
                              <option
                                value={unit.id}
                                selected={unit?.id == property?.unit.id}
                              >
                                {unit?.name}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <>
                            <Form.Control
                              type="text"
                              defaultValue="No Unit"
                              disabled
                            />
                          </>
                        )}

                        <Button
                          variant="link"
                          size="sm"
                          className="text-danger float-end"
                          onClick={() => {
                            deleteProperty(property);
                            setEditMode(false);
                          }}
                        >
                          <MinusCircle />
                        </Button>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="property-table-name fw-bold">
                        {property.display_name}
                      </td>
                      <td className="property-table-value">
                        {propertyValueRepresentation(property)}
                      </td>
                    </tr>
                  )
                )}
              <tr className="mb-2">
                <td className="property-table-name fw-bold">Description</td>
                <td className="property-table-value">
                  {editMode ? (
                    <>
                      <Form.Control
                        type="text"
                        defaultValue={part?.description}
                        onBlur={(event) => {
                          updatePart({ description: event.target.value });
                        }}
                      />
                    </>
                  ) : (
                    <>{part?.description}</>
                  )}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      {part?.docs.length > 0 ? (
        <Row className="mt-2">
          <h3>Docs</h3>
          <hr></hr>
          <ListGroup>
            {part?.docs.map((doc) =>
              doc.type !== "image" ? (
                <ListGroup.Item
                  className="list-group-item-action"
                  onClick={() => {
                    window.open(`http://localhost:3279/doc?id=${doc.id}`);
                  }}
                >
                  {doc.type == "datasheet" ? <FileText /> : <></>}
                  <span className="ms-3 text-capitalize">{doc.type}</span>
                </ListGroup.Item>
              ) : (
                <></>
              )
            )}
          </ListGroup>
        </Row>
      ) : (
        <></>
      )}
    </>
  );
};

export default PartView;
