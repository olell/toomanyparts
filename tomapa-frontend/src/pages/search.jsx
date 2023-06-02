import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import PartsList from "../components/parts_list";

import { getApiEndpoint } from "../util/api";

const SearchPage = ({ query }) => {
  const [parts, setParts] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(getApiEndpoint("/search"), { params: { query: query } })
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
      <PartsList
        parts={parts}
        onClick={(part) => {
          navigate(`/part/${part.id}`);
        }}
      />
    </>
  );
};

export default SearchPage;
