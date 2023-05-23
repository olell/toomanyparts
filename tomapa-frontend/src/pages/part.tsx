import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PartView = () => {
  const { id } = useParams();
  const [part, setPart] = useState<any>(null);
  const [categoryPath, setCategoryPath] = useState<any[]>();
  useEffect(() => {
    axios
      .get("http://localhost:3279/part", { params: { id: id } })
      .then((response: any) => {
        if (response.status === 200) {
          setPart(response.data);
        }
      });
  }, [id]);
  useEffect(() => {
    let cat = part?.category;
    let path: any[] = [];
    do {
      path.push(cat);
      cat = cat?.parent;
    } while (cat);
    setCategoryPath(path.reverse());
  }, [part]);
  return (
    <>
      <h1>{part?.description}</h1>
      <hr></hr>
      {categoryPath?.map((el: any) => (
        <>
          <a href="#">{el?.name}</a>
          {el?.children?.length > 0 ? " / " : " "}
        </>
      ))}
    </>
  );
};

export default PartView;
