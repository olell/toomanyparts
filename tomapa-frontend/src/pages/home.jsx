import axios from "axios";
import { useEffect, useState } from "react";

import { getApiEndpoint } from "../util/api";
import { useNavigate } from "react-router-dom";
import { CategoryAccordion } from "../components/category_sidebar";

import { Button } from "react-bootstrap";
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

  const [parts, setParts] = useState();
  const [potd, setPotd] = useState();

  useEffect(() => {
    axios.get(getApiEndpoint("/parts")).then((result) => {
      if (result.status === 200) {
        setParts(result.data.parts);
      }
    });
  }, []);

  useEffect(() => {
    if (!!parts) {
      setPotd(parts[Math.floor(Math.random() * parts?.length)]);
    }
  }, [parts]);


  return (
    <>
      <h1>Welcome!</h1>
      <hr></hr>
      <h4>Random Part from your collection:</h4>
      <Button
        className="heading-2"
        variant="link"
        onClick={() => {
          navigate(`/part/${potd?.id}`);
        }}
      >
        {!!potd ? generateDisplayName(potd) : ""}
      </Button>
      <hr></hr>
      <CategoriesContainer partsChanged={partsChanged}/>
      
      </>
  );
};

export default Home;
