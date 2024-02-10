import { Row, Col, ListGroup } from "react-bootstrap";
import { Battery, Database, List, User } from "react-feather";
import { useNavigate } from "react-router-dom";

const AdminSidebar = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="sidebar">
        <Row>
          <Col className="ms-2 mt-1">
            <h3>Admin</h3>
          </Col>
        </Row>
        <Row>
          <ListGroup>
            <ListGroup.Item
              className="ms-3 border-0 list-group-item-action"
              onClick={() => {
                navigate("/admin/user");
              }}
            >
              <User></User> User
            </ListGroup.Item>
            <ListGroup.Item
              className="ms-3 border-0 list-group-item-action"
              onClick={() => {
                navigate("/admin/database");
              }}
            >
              <Database></Database> Database
            </ListGroup.Item>
            <ListGroup.Item
              className="ms-3 border-0 list-group-item-action"
              onClick={() => {
                navigate("/admin/categories");
              }}
            >
              <List></List> Categories
            </ListGroup.Item>
            <ListGroup.Item
              className="ms-3 border-0 list-group-item-action"
              onClick={() => {
                navigate("/admin/units");
              }}
            >
              <Battery></Battery> Units
            </ListGroup.Item>
          </ListGroup>
        </Row>
      </div>
    </>
  );
};
export default AdminSidebar;
