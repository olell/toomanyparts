import axios from "axios";
import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router";
import { generateDisplayName } from "../util/stringen";

const PartsList = ({ filter }) => {
  const [parts, setParts] = useState();
  const navigate = useNavigate();
  useEffect(() => {
    console.log("filter...", filter);
    axios
      .get("http://localhost:3279/parts", { params: filter })
      .then((response) => {
        if (response.status === 200) {
          setParts(response.data.parts);
        }
      });
  }, [filter]);

  return (
    <>
      <ListGroup>
        {parts?.map((part) => (
          <>
            <ListGroup.Item
              className="list-group-item-action"
              onClick={() => {
                navigate(`/part/${part.id}`);
              }}
            >
              {generateDisplayName(part)}
            </ListGroup.Item>
          </>
        ))}
      </ListGroup>
    </>
  );
};

export default PartsList;
