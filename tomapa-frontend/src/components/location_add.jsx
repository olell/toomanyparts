import {
  Button,
  Form,
  FormControl,
  FormGroup,
  InputGroup,
  Modal,
} from "react-bootstrap";
import axios from "axios";
import { useState } from "react";

import { getApiEndpoint } from "../util/api";

const AddLocationModal = ({ show, setShow, onAdd = (id) => {} }) => {
  const [value, setValue] = useState("");
  return (
    <>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Storage Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              autoCorrect={false}
              placeholder="Storage Location Name"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            ></Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
          <Button
            variant="success"
            disabled={!!!value}
            onClick={() => {
              if (!!value) {
                axios
                  .post(getApiEndpoint("/storelocation"), { name: value })
                  .then((result) => {
                    if (result.status === 200) {
                      console.log(result);
                      onAdd(result.data.id);
                    }
                  })
                  .finally(() => {
                    setValue("");
                    setShow(false);
                  });
              }
            }}
          >
            Add "{value}"
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddLocationModal;
