import { Button, Modal } from "react-bootstrap";
import { useState } from "react";

const QuestionModal = ({ show, setShow, question, text, variant, action }) => {
  return (
    <>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{question}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{text}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            No
          </Button>
          <Button variant={variant} onClick={action}>
            Yes!
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default QuestionModal;
