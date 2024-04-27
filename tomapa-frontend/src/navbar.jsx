import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  FormGroup,
  FormControl,
} from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";

const NavBar = ({ theme, setTheme, setSearchQuery }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [queryInput, setQueryInput] = useState("");

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      if (queryInput !== "") {
        setSearchQuery(queryInput);
        navigate("/search");
      }
    }, 1000);
    return () => clearTimeout(searchDebounce);
  }, [queryInput]);

  return (
    <Navbar
      bg="primary"
      className={
        theme === "dark"
          ? `navbar navbar-expand-lg bg-body-tertiary`
          : `navbar navbar-expand-lg bg-dark`
      }
      data-bs-theme={"dark"}
      expand="lg"
    >
      <Container className="ms-2 navbar-container me-2">
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
            <Nav.Link
              onClick={() => {
                navigate("/bom");
              }}
              active={location.pathname == "/bom"}
            >
              BOM Tool
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                navigate("/observer");
              }}
              active={location.pathname == "/observer"}
            >
              Monitoring
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                navigate("/scanner");
              }}
              active={location.pathname == "/scanner"}
            >
              Scanner
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                navigate("/admin/database");
              }}
              active={location.pathname.match(/admin/) !== null}
            >
              Admin
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
          <FormGroup className="search-bar">
            <FormControl
              type="text"
              placeholder="Search Parts"
              expand="lg"
              onChange={(e) => {
                setQueryInput(e.target.value);
              }}
            ></FormControl>
          </FormGroup>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
