import axios from "axios";
import { useEffect, useState } from "react";

import { getApiEndpoint } from "../util/api";
import { useNavigate } from "react-router-dom";
import { CategoryAccordion } from "../components/category_sidebar";

import { Button, ListGroup } from "react-bootstrap";
import { generateDisplayName } from "../util/part";

const CategoriesContainer = ({ partsChanged }) => {
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
    <div class="category-container">
      {CategoryAccordion(categories, navigate)}
    </div>
  );
};

const Home = (partsChanged) => {
  const navigate = useNavigate();

  const [lowStockParts, setLowStockParts] = useState([]);

  useEffect(() => {
    axios.get(getApiEndpoint("/stock/notifications")).then((response) => {
      if (response.status == 200 && !!response.data.low_stock) {
        setLowStockParts(response.data.low_stock);
        console.log("Retreived low stock parts");
      }
    });
  }, []);

  return (
    <>
      <h1>Welcome!</h1>
      <hr></hr>
      <CategoriesContainer partsChanged={partsChanged} />
      <div className="low-stock-notifications">
        <h3>Low Stock Parts:</h3>
        <ListGroup>
          {lowStockParts.map((part) => (
            <>
              <ListGroup.Item
                action
                onClick={(e) => {
                  navigate(`/part/${part.id}`);
                }}
              >
                {generateDisplayName(part)} (x<b>{part.stock}</b>)
              </ListGroup.Item>
            </>
          ))}
        </ListGroup>
      </div>
    </>
  );
};

export default Home;
