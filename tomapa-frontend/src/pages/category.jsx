import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PartsList from "./parts_list";

const Category = () => {
  const { id } = useParams();
  const [category, setCategory] = useState();
  const [partsFilter, setPartsFilter] = useState();

  useEffect(() => {
    axios
      .get("http://localhost:3279/category", { params: { id: id } })
      .then((response) => {
        if (response.status === 200) {
          setCategory(response.data);
        }
      })
      .finally(() => {
        setPartsFilter({
          category: id,
          category_children: true,
        });
      });
  }, [id]);

  useEffect(() => {}, [category]);

  return (
    <>
      <h1>{category?.name}</h1>
      <hr></hr>
      {category !== undefined ? <PartsList filter={partsFilter} /> : <></>}
    </>
  );
};

export default Category;
