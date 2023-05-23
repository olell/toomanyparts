import React from "react";
import logo from "./logo.svg";
import "./App.css";
import "./bootstrap.min.css";
import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/home";
import Navbar from "./navbar";

function App() {
  return (
    <>
      <Navbar />
      <Container className="mt-5">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
