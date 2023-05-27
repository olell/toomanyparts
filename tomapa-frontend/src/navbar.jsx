import { Container, Nav, Navbar } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Navbar bg="primary" className="navbar-dark fixed-top" expand="lg">
      <Container className="ms-2">
        <Navbar.Brand
          onClick={() => {
            navigate("/");
          }}
        >
          TooManyParts
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              onClick={() => {
                navigate("/");
              }}
              active={location.pathname == "/"}
            >
              Home
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                navigate("/newpart");
              }}
              active={location.pathname == "/newpart"}
            >
              New Part
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
