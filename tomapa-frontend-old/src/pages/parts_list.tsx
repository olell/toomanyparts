import axios from "axios";
import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router";

interface PartsListProps {
  filter: any;
}

const PartsList = ({ filter }: PartsListProps) => {
  const [parts, setParts] = useState<[any]>();
  const navigate = useNavigate();
  useEffect(() => {
    console.log("filter...", filter);
    axios
      .get("http://localhost:3279/parts", { params: filter })
      .then((response: any) => {
        if (response.status === 200) {
          setParts(response.data.parts);
        }
      });
  }, [filter]);

  return (
    <>
      <ListGroup>
        {parts?.map((part: any) => (
          <>
            <ListGroup.Item
              className="list-group-item-action"
              onClick={() => {
                navigate(`/part/${part.id}`);
              }}
            >
              {part.description}
            </ListGroup.Item>
          </>
        ))}
      </ListGroup>
    </>
  );
};

export default PartsList;
