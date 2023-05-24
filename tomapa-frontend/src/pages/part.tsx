import axios from "axios";
import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

const PartView = () => {
  const { id } = useParams();
  const [part, setPart] = useState<any>(null);
  const [categoryPath, setCategoryPath] = useState<any[]>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<number>();
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
  }, [part]);
  return (
    <>
      <h1>{part?.description}</h1>
      <hr></hr>
      <Row>
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
      </Row>
    </>
  );
};

export default PartView;
