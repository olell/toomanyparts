import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  FormGroup,
  FormControl,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

const NavBar = ({ theme, setTheme, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Navbar
      bg="primary"
      className={`${
        theme == "dark" ? "navbar-dark bg-dark" : "navbar-dark"
      } fixed-top`}
      expand="lg"
    >
      <Container className="ms-2">
        <Navbar.Brand
          onClick={() => {
            navigate("/");
          }}
        >
          <img
            alt=""
            src="/logo.svg"
            style={{ filter: "invert(100%)" }}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
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
            <NavDropdown title="Theme" className="float-end">
              <NavDropdown.Item onClick={() => setTheme("dark")}>
                Dark
              </NavDropdown.Item>
              <NavDropdown.Item onClick={() => setTheme("light")}>
                Light
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <FormGroup>
            <FormControl
              type="text"
              placeholder="Search Parts"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                navigate("/search");
              }}
            ></FormControl>
          </FormGroup>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
