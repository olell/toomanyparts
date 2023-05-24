import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Col, Form, ListGroup, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { Edit2, MinusCircle, PlusCircle, Trash2 } from "react-feather";

function propertyValueRepresentation(property: any) {
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

const PartView = () => {
  const { id } = useParams();
  const [part, setPart] = useState<any>(null);
  const [categoryPath, setCategoryPath] = useState<any[]>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<number>();
  const [heading, setHeading] = useState<string>("");

  const updatePart = (attributes: any) => {
    let data = {
      id: part.id,
      ...attributes,
    };
    axios.put("http://localhost:3279/part", data).then((response: any) => {
      if (response.status === 200) {
        setPart(response.data);
      }
    });
  };

  useEffect(() => {
    axios
      .get("http://localhost:3279/part", { params: { id: id } })
      .then((response: any) => {
        if (response.status === 200) {
          setPart(response.data);
        }
      });
  }, [id]);
  useEffect(() => {
    let cat = part?.category;
    let path: any[] = [];
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

    setHeading(part?.description);
    if (part?.properties.length > 0) {
      for (let i = 0; i < part?.properties.length; i++) {
        if (part?.properties[i].name == "mfr_no") {
          setHeading(part?.properties[i].value);
          break;
        }
      }
    }
  }, [part]);
  return (
    <>
      <h1>{heading}</h1>
      {heading !== part?.description ? <span>{part?.description}</span> : <></>}

      <hr></hr>
      <Row>
        {/* Category Path */}
        <Col>
          {categoryPath?.map((el: any) => (
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
            {part?.docs.map((doc: any) =>
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
        </Col>
        {/* Properties */}
        <Col>
          <Button
            variant="link"
            size="sm"
            className="text-primary float-end"
            onClick={() => {}}
          >
            <Edit2 />
          </Button>
          <Button
            variant="link"
            size="sm"
            className="text-danger float-end"
            onClick={() => {}}
          >
            <Trash2 />
          </Button>
          <Table>
            <tbody>
              <tr>
                <td className="property-table-name fw-bold">
                  Stock
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
                </td>
                <td className="property-table-value">{part?.stock}</td>
              </tr>
              <tr className="mb-2">
                <td className="property-table-name fw-bold">Location</td>
                <td className="property-table-value">{part?.location.name}</td>
              </tr>
              {part?.properties
                .sort((a: any, b: any) =>
                  a.name > b.name ? 1 : b.name > a.name ? -1 : 0
                )
                .map((property: any) => (
                  <tr>
                    <td className="property-table-name fw-bold">
                      {property.display_name}
                    </td>
                    <td className="property-table-value">
                      {propertyValueRepresentation(property)}
                    </td>
                  </tr>
                ))}
              <tr>
                <td className="property-table-name fw-bold">Description</td>
                <td className="property-table-value">{part?.description}</td>
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
            {part?.docs.map((doc: any) =>
              doc.type !== "image" ? (
                <ListGroup.Item
                  onClick={() => {
                    window.open(`http://localhost:3279/doc?id=${doc.id}`);
                  }}
                >
                  {doc.type}
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
