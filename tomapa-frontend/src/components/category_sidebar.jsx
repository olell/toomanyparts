import { Badge, Button, Col, Container, Row } from "react-bootstrap";
import { NavigateFunction, useNavigate } from "react-router-dom";

import { Accordion, ListGroup } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import { RefreshCw } from "react-feather";

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
        <ListGroup>
          {categories?.map((category) => (
            <>
              {category.parts_count > 0 ? (
                <>
                  {category.children.length > 0 ? (
                    <Accordion.Item eventKey={category.name}>
                      <Accordion.Header>
                        <Badge bg="secondary" className="me-2">
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
                      <Badge bg="secondary" className="me-2">
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
    axios.get("http://localhost:3279/categories").then((result) => {
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
      <div className="category-sidebar">
        <Row>
          <Col className="ms-2 mt-1">
            <h4>Categories</h4>
          </Col>
          <Col>
            <Button
              variant="link"
              size="sm"
              className="text-info float-end"
              onClick={loadCategories}
            >
              <RefreshCw />
            </Button>
          </Col>
        </Row>
        {CategoryAccordion(categories, navigate)}
      </div>
    </>
  );
};

export default CategoriesSidebar;
