import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import PartsList from "../components/parts_list";
import PropertyFilter from "../components/property_filter";
import { getApiEndpoint } from "../util/api";

const Category = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState();

  const [partsFilter, setPartsFilter] = useState();
  const [propertyFilter, setPropertyFilter] = useState();

  const [parts, setParts] = useState();

  const [properties, setProperties] = useState({});
  const [units, setUnits] = useState();

  const [allValues, setAllValues] = useState([]);

  useEffect(() => {
    let newAllValues = [];
    parts?.forEach((part) => {
      part?.properties.forEach((partProperty) => {
        newAllValues.push(partProperty.value);
      });
    });
    setAllValues(newAllValues);
  }, [parts]);

  useEffect(() => {
    axios
      .post(getApiEndpoint("/parts"), partsFilter)
      .then((response) => {
        if (response.status === 200) {
          setParts(response.data.parts);
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, [partsFilter]);

  useEffect(() => {
    axios
      .get(getApiEndpoint("/category"), { params: { id: id } })
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
    axios.get(getApiEndpoint("/units")).then((result) => {
      if (result.status === 200) {
        setUnits(result.data.units);
      }
    });

    axios
      .get(getApiEndpoint("/properties"), { params: { category: id } })
      .then((result) => {
        if (result.status === 200) {
          setProperties(result.data.properties);
        }
      });
  }, [id]);

  useEffect(() => {
    if (!!propertyFilter) {
      let filter_list = Object.keys(propertyFilter).map((k) => ({
        name: k,
        allowed_values: propertyFilter[k].allowed_values,
      }));
      console.log("as_list", filter_list);
      setPartsFilter({
        ...partsFilter,
        property_filter: filter_list,
      });
    }
  }, [propertyFilter]);

  return (
    <>
      <h1>{category?.name}</h1>
      <hr></hr>
      <div className="d-flex">
        {Object.values(properties)?.map((property) => (
          <PropertyFilter
            property={property}
            allValues={allValues}
            units={units}
            filter={propertyFilter}
            setFilter={setPropertyFilter}
          />
        ))}
      </div>
      {category !== undefined ? (
        <PartsList
          parts={parts}
          onClick={(part) => {
            navigate(`/part/${part.id}`);
          }}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default Category;
