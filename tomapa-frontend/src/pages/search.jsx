import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PartsList from "../components/parts_list";
import PropertyFilter from "../components/property_filter";

const SearchPage = ({ query }) => {
  const [parts, setParts] = useState();

  useEffect(() => {
    axios
      .get("http://localhost:3279/search", { params: { query: query } })
      .then((response) => {
        if (response.status === 200) {
          setParts(response.data.parts);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, [query]);

  return (
    <>
      <h1>Search: "{query}"</h1>
      <hr></hr>
      <PartsList parts={parts} />
    </>
  );
};

export default SearchPage;
