import "./App.css";
import "./bootstrap.min.css";
import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/home";
import Navbar from "./navbar";
import CategoriesSidebar from "./category_sidebar";
import Category from "./pages/category";

import { Accordion, ListGroup } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import PartView from "./pages/part";

function App() {
  return (
    <>
      <Navbar />
      <CategoriesSidebar />
      <Container className="content-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/part/:id" element={<PartView />} />
          <Route path="/category/:id" element={<Category />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
