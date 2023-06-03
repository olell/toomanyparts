import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiEndpoint } from "../util/api";
import { Table, Modal, Button, Container, Row, Col } from "react-bootstrap";
import { generateDisplayName, getImageUrl } from "../util/part";
import { Trash2 } from "react-feather";

import PartView from "./part";
import QuestionModal from "../components/question_modal";

const BOMView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bom, setBom] = useState();
  const [bomStock, setBomStock] = useState();

  const [modalPart, setModalPart] = useState();
  const [modalPartCount, setModalPartCount] = useState(0);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [imageMarkerX, setImageMarkerX] = useState(-1);
  const [imageMarkerY, setImageMarkerY] = useState(-1);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const reducePartStock = (part, amount) => {
    let data = {
      id: part.id,
      stock: part.stock - amount,
    };
    axios.put(getApiEndpoint("/part"), data).then((response) => {
      if (response.status === 200) {
        loadBom();
      }
    });
  };

  const loadBom = () => {
    axios.get(getApiEndpoint("/bom"), { params: { id: id } }).then((result) => {
      if (result.status === 200) {
        setBom(result.data);
        console.log(result.data);
      }
    });
  };

  const deleteBOM = () => {
    let data = {
      id: id,
    };
    axios.delete(getApiEndpoint("/bom"), { data: data }).then((response) => {
      if (response.status === 204) {
        navigate("/");
      }
    });
  };

  useEffect(() => {
    loadBom();
  }, [id]);

  useEffect(() => {
    let minStock = null;
    bom?.parts.forEach((bompart) => {
      let count = bompart.designators.length;
      let stock = bompart.part.stock;
      let bomPartStock = Math.floor(stock / count);
      if (minStock === null || bomPartStock < minStock) {
        minStock = bomPartStock;
      }
    });
    setBomStock(minStock);
  }, [bom]);

  return (
    <>
      <h1>{bom?.name}</h1>

      {bomStock > 0 ? (
        <span>Enough parts in stock to build this BOM {bomStock} times!</span>
      ) : (
        <span className="text-danger">
          Not enough parts in stock to build this BOM!
        </span>
      )}

      <Button
        variant="link"
        size="sm"
        className="text-danger ms-3 float-end"
        onClick={() => {
          setShowDeleteModal(true);
        }}
      >
        <Trash2 />
      </Button>
      <QuestionModal
        show={showDeleteModal}
        setShow={setShowDeleteModal}
        question="Are you sure?"
        text="This will delete the selected BOM forever!"
        action={() => {
          deleteBOM();
        }}
        variant="danger"
      />
      <hr></hr>
      <Row>
        <Col className="col-md-3">
          <h5>PCB Image</h5>
          {imageMarkerX === -1 || imageMarkerY === -1 ? (
            <></>
          ) : (
            <>
              <div
                style={{
                  top: imageHeight * imageMarkerY + 10,
                  left: imageWidth * imageMarkerX,
                }}
                class="red-circle"
              ></div>
            </>
          )}

          <img
            id="pcbImage"
            className="bom-pcb-image"
            src={getApiEndpoint(`/bom/image?id=${bom?.id}`)}
            onLoad={(e) => {
              setImageWidth(e.target.offsetWidth);
              setImageHeight(e.target.offsetHeight);
              console.log(e.target.offsetWidth, e.target.offsetHeight);
            }}
          />
        </Col>
        <Col className="col-md-9">
          <Table striped hover>
            <thead>
              <tr>
                <th>IMG</th>
                <th>Designators</th>
                <th>Count</th>
                <th>Part Stock</th>
                <th>Part Location</th>
                <th>Part ID</th>
                <th>Part Name</th>
              </tr>
            </thead>
            <tbody>
              {bom?.parts.map((bomPart) => (
                <tr>
                  <td>
                    <img
                      className="img-thumb"
                      src={getImageUrl(bomPart.part)}
                    ></img>
                  </td>
                  <td>
                    {bomPart.designators.map((d, idx) => (
                      <>
                        <a
                          href="javascript:null"
                          onClick={() => {
                            setImageMarkerX(d.location_x);
                            setImageMarkerY(d.location_y);
                          }}
                        >
                          {d.name}
                        </a>{" "}
                        {idx != bomPart.designators.length - 1 ? "," : ""}{" "}
                      </>
                    ))}
                  </td>
                  <td>{bomPart.designators.length}</td>
                  <td>{bomPart.part.stock}</td>
                  <td>{bomPart.part.location.name}</td>
                  <td>#{bomPart.part.id}</td>
                  <td>
                    <a
                      href="javascript:null"
                      onClick={() => {
                        setModalPart(bomPart.part);
                        setModalPartCount(bomPart.designators.length);
                        setShowPartModal(true);
                      }}
                    >
                      {generateDisplayName(bomPart.part)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      {!!modalPart ? (
        <>
          <Modal
            size="xl"
            show={showPartModal}
            onHide={() => setShowPartModal(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                <h3>
                  <a
                    href="javascript:null"
                    onClick={() => navigate(`/part/${modalPart.id}`)}
                  >
                    {generateDisplayName(modalPart)}
                  </a>
                </h3>
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <PartView showControls={false} partId={modalPart.id} />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="danger"
                onClick={() => {
                  reducePartStock(modalPart, modalPartCount);
                  setShowPartModal(false);
                }}
              >
                Reduce stock by {modalPartCount}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowPartModal(false)}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default BOMView;
