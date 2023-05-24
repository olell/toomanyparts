import "./App.css";
import "./bootstrap.min.css";
import { Badge, Container, Row } from "react-bootstrap";
import { NavigateFunction, useNavigate } from "react-router-dom";

import { Accordion, ListGroup } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";

function CategoryAccordion(categories: any, navigate: NavigateFunction) {
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
          {categories?.map((category: any) => (
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
                    <ListGroup.Item className="border-0 bg-light">
                      <Badge bg="secondary" className="me-2">
                        {category.parts_count}
                      </Badge>
                      <a
                        href="javascript:null"
                        onClick={() => {
                          navigate(`/category/${category.id}`);
                        }}
                      >
                        {category.name}
                      </a>
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

const CategoriesSidebar = () => {
  const [categories, setCategories] = useState<[any]>();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3279/categories").then((result: any) => {
      if (result.status === 200) {
        setCategories(result.data.categories);
        console.log(categories);
      }
    });
  }, []);

  return (
    <>
      <div className="category-sidebar">
        {CategoryAccordion(categories, navigate)}
      </div>
    </>
  );
};

export default CategoriesSidebar;
