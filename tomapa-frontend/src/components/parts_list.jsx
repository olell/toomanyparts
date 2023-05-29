import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router";
import { generateDisplayName } from "../util/stringen";
import { ChevronUp, ChevronDown } from "react-feather";

const PartsList = ({ parts }) => {
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
    <>
      <Table striped hover style={{ cursor: "pointer" }}>
        <thead>
          <tr>
            <th>
              <span className="d-flex">
                #
                <Button
                  className="sortbutton"
                  variant="link"
                  onClick={() => {
                    setOrderBy("id");
                    setOrderDirection(1);
                  }}
                >
                  <ChevronUp />
                </Button>
                <Button
                  className="sortbutton"
                  variant="link"
                  onClick={() => {
                    setOrderBy("id");
                    setOrderDirection(0);
                  }}
                >
                  <ChevronDown />
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
                    setOrderDirection(1);
                  }}
                >
                  <ChevronUp />
                </Button>
                <Button
                  className="sortbutton"
                  variant="link"
                  onClick={() => {
                    setOrderBy("stock");
                    setOrderDirection(0);
                  }}
                >
                  <ChevronDown />
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
                  navigate(`/part/${part.id}`);
                }}
              >
                <td>{part.id}</td>
                <td>{getProperty(part, "mfr").value}</td>
                <td>{getProperty(part, "mfr_no").value}</td>
                <td>{part.stock}</td>
                <td>{part.description}</td>
              </tr>
            ))}
        </tbody>
      </Table>
    </>
  );
};

export default PartsList;
