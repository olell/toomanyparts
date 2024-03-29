import { Badge, Button, Col, Container, Row } from "react-bootstrap";
import { NavigateFunction, useNavigate } from "react-router-dom";

import { Accordion, ListGroup } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";

import { getApiEndpoint } from "../util/api";

function CategoryAccordion(categories, navigate) {
  /*
  Recursively generates nested bootstrap accordions to display
  all available part categories.
  */
  return (
    <>
      <Accordion
        className="accordion-flush categories-accordion"
        defaultActiveKey="0"
      >
        <ListGroup className="categories-list">
          {categories?.map((category) => (
            <>
              {category.parts_count > 0 ? (
                <>
                  {category.children.length > 0 ? (
                    <Accordion.Item eventKey={category.name}>
                      <Accordion.Header>
                        <Badge bg="info" className="me-2">
                          {category.parts_count}
                        </Badge>
                        {category.name}
                      </Accordion.Header>
                      <Accordion.Body className="cat-acc-body">
                        {category.children.length > 0 ? (
                          <>{CategoryAccordion(category.children, navigate)}</>
                        ) : (
                          <>{category.name}</>
                        )}
                      </Accordion.Body>
                    </Accordion.Item>
                  ) : (
                    <ListGroup.Item
                      onClick={() => {
                        navigate(`/category/${category.id}`);
                      }}
                      className="border-0 list-group-item-action"
                    >
                      <Badge bg="primary" className="me-2">
                        {category.parts_count}
                      </Badge>
                      {category.name}
                    </ListGroup.Item>
                  )}
                </>
              ) : (
                <></>
              )}
            </>
          ))}
        </ListGroup>
      </Accordion>
    </>
  );
}

const CategoriesSidebar = ({ partsChanged }) => {
  const [categories, setCategories] = useState();
  const navigate = useNavigate();

  const loadCategories = () => {
    axios.get(getApiEndpoint("/categories")).then((result) => {
      if (result.status === 200) {
        setCategories(result.data.categories);
      }
    });
  };

  useEffect(() => {
    loadCategories();
  }, [partsChanged]);

  return (
    <>
      <div className="sidebar">
        <Row>
          <Col className="ms-2 mt-1">
            <h4>Categories</h4>
          </Col>
        </Row>
        <Row className="categories-row">
          {CategoryAccordion(categories, navigate)}
        </Row>
      </div>
    </>
  );
};

export default CategoriesSidebar;
export { CategoriesSidebar, CategoryAccordion };
