import { Button } from "react-bootstrap";
import { getApiEndpoint } from "../../util/api";
import axios from "axios";

const DBAdmin = () => {
  return (
    <>
      <h1>Database Management</h1>
      <hr></hr>
      <Button
        variant="info"
        size="md"
        onClick={(e) => {
          axios.get(getApiEndpoint("/db/export")).then((result) => {
            if (result.status === 200) {
              var element = document.createElement("a");
              element.setAttribute(
                "href",
                "data:text/plain;charset=utf-8," +
                  encodeURIComponent(JSON.stringify(result.data, null, 4))
              );
              element.setAttribute("download", "tomapa_export.json");
              element.style.display = "none";
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
            }
          });
        }}
      >
        Export Data
      </Button>
      <Button variant="info" size="md" className="ms-2" onClick={(e) => {}}>
        Import Data
      </Button>
    </>
  );
};
export default DBAdmin;
