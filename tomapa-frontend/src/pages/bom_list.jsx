import axios from "axios";
import { useEffect, useState } from "react";
import { getApiEndpoint } from "../util/api";
import { Form, ListGroup } from "react-bootstrap";

const BOMPage = () => {
  const [boms, setBoms] = useState([]);
  const [bomFilter, setBomFilter] = useState("");

  useEffect(() => {
    axios.get(getApiEndpoint("/boms")).then((result) => {
      if (result.status === 200) {
        setBoms(result.data.boms);
      }
    });
  }, []);

  return (
    <>
      <h1>Your BOMs</h1>
      <hr />
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
              <ListGroup.Item action>
                {bom.name} ({bom.parts} Parts)
              </ListGroup.Item>
            </>
          ))}
      </ListGroup>
    </>
  );
};

export default BOMPage;
