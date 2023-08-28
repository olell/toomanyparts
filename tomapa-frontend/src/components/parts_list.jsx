import { useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { ChevronUp, ChevronDown } from "react-feather";

import { getImageUrl } from "../util/part";

const PartsList = ({ parts, onClick = (part) => {} }) => {
  const navigate = useNavigate();
  const [orderBy, setOrderBy] = useState("id");
  const [orderDirection, setOrderDirection] = useState(1);

  const getProperty = (part, propertyName) => {
    let result = {};
    part.properties.forEach((element) => {
      if (element.name === propertyName) {
        result = element;
      }
    });
    return result;
  };

  return (
    <div style={{ overflowX: "scroll" }}>
      <Table striped hover style={{ cursor: "pointer" }}>
        <thead>
          <tr>
            <th></th>
            <th>
              <span className="d-flex">
                #
                <Button
                  className="sortbutton"
                  variant="link"
                  onClick={() => {
                    setOrderBy("id");
                    setOrderDirection(!orderDirection);
                  }}
                >
                  {orderBy == "id" && orderDirection == 0 ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </Button>
              </span>
            </th>
            <th>Manufacturer</th>
            <th>Manufacturer #</th>
            <th>
              <span className="d-flex">
                Stock
                <Button
                  className="sortbutton"
                  variant="link"
                  onClick={() => {
                    setOrderBy("stock");
                    setOrderDirection(!orderDirection);
                  }}
                >
                  {orderBy == "stock" && orderDirection == 0 ? (
                    <ChevronUp />
                  ) : (
                    <ChevronDown />
                  )}
                </Button>
              </span>
            </th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {parts
            ?.sort((a, b) => {
              return orderDirection
                ? a[orderBy] > b[orderBy]
                : a[orderBy] < b[orderBy];
            })
            .map((part) => (
              <tr
                onClick={() => {
                  onClick(part);
                }}
              >
                <td>
                  <img
                    className="img-thumb"
                    loading="lazy"
                    src={getImageUrl(part)}
                  ></img>
                </td>
                <td>{part.id}</td>
                <td>{getProperty(part, "mfr").value}</td>
                <td>{getProperty(part, "mfr_no").value}</td>
                <td>{part.stock}</td>
                <td>{part.description}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PartsList;
