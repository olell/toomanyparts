import "./App.css";
import "./bootstrap.min.css";
import { Badge, Container, Row } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/home";
import Navbar from "./navbar";

import { Accordion, ListGroup } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";

function categoryAccordion(categories: any) {
  /*
  Recursively generates nested bootstrap accordions to display
  all available part categories.
  */
  console.log(categories);
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
                          <>{categoryAccordion(category.children)}</>
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
                      <a href="#">{category.name} </a>
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
      <div className="category-sidebar">{categoryAccordion(categories)}</div>
    </>
  );
};

export default CategoriesSidebar;
