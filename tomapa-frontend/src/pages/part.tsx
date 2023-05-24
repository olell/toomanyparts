import axios from "axios";
import { useEffect, useState } from "react";
import { Col, Row, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

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
            {part?.docs.map((doc: any) => (
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
            ))}
          </Row>
        </Col>
        {/* Properties */}
        <Col>
          <Table>
            <tbody>
              <tr>
                <td className="property-table-name fw-bold">Stock</td>
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
    </>
  );
};

export default PartView;
