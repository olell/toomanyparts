import axios from "axios";
import { useEffect, useState } from "react";
import { getApiEndpoint } from "../util/api";
import { Form, ListGroup, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const BOMPage = () => {
  const [boms, setBoms] = useState([]);
  const [bomFilter, setBomFilter] = useState("");

  const [bomFile, setBomFile] = useState();
  const [pcbImage, setPcbImage] = useState();
  const [rptFile, setRPTFile] = useState();

  const [bomName, setBomName] = useState("");
  const [bomDescription, setBomDescription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadBOMs();
  }, []);

  const loadBOMs = () => {
    axios.get(getApiEndpoint("/boms")).then((result) => {
      if (result.status === 200) {
        setBoms(result.data.boms);
      }
    });
  };

  const postBOM = (file, imagefile, rptfile, name, description) => {
    var data = new FormData();
    data.append("file", file);
    if (!!imagefile) {
      data.append("image_file", imagefile);
    }
    data.append("name", name);
    if (!!description) {
      data.append("description", description);
    }
    if (!!rptfile) {
      data.append("rpt", rptfile);
    }
    axios
      .post(getApiEndpoint("/bom"), data, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        loadBOMs();
      });
  };

  return (
    <>
      <h1>BOM Tool</h1>
      <hr />
      <h4>Upload a BOM</h4>
      <>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={bomName}
            onChange={(e) => setBomName(e.target.value)}
          ></Form.Control>
        </Form.Group>
        <Form.Group controlId="formFile">
          <Form.Label>BOM CSV File</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => {
              if (e.target.files.length == 1) {
                setBomFile(e.target.files[0]);
              }
            }}
          />
        </Form.Group>
        <Form.Group controlId="formImgFile">
          <Form.Label>PCB Image</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => {
              if (e.target.files.length == 1) {
                setPcbImage(e.target.files[0]);
              }
            }}
          />
        </Form.Group>
        <Form.Group controlId="formRotFile">
          <Form.Label>Footprint Report (Optional)</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => {
              if (e.target.files.length == 1) {
                setRPTFile(e.target.files[0]);
              }
            }}
          />
        </Form.Group>
        <Button
          variant="success"
          className="mt-1"
          onClick={() => {
            postBOM(bomFile, pcbImage, rptFile, bomName, bomDescription);
          }}
        >
          Create BOM
        </Button>
      </>
      <hr />
      <h4>Your BOMs</h4>
      <Form.Group>
        <Form.Label>Filter BOMs by Name:</Form.Label>
        <Form.Control
          type="text"
          placeholder="BOM Name"
          value={bomFilter}
          onChange={(e) => setBomFilter(e.target.value)}
        ></Form.Control>
      </Form.Group>
      <h4 className="mt-3">BOMs:</h4>
      <ListGroup>
        {boms
          ?.filter((bom) =>
            bom.name.toLowerCase().includes(bomFilter.toLowerCase())
          )
          .map((bom) => (
            <>
              <ListGroup.Item
                action
                onClick={(e) => {
                  navigate(`/bomview/${bom.id}`);
                }}
              >
                {bom.name} ({bom.parts} Parts)
              </ListGroup.Item>
            </>
          ))}
      </ListGroup>
    </>
  );
};

export default BOMPage;
