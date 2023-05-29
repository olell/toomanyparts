import "./App.css";
import { Container } from "react-bootstrap";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/home";
import Navbar from "./navbar";
import CategoriesSidebar from "./components/category_sidebar";
import Category from "./pages/category";

import PartView from "./pages/part";
import CreatePart from "./pages/create_part";
import SearchPage from "./pages/search";

function App() {
  const [partsChanged, setPartsChanged] = useState(0);
  var storedTheme = localStorage.getItem("bstheme");
  if (!!!storedTheme) storedTheme = "solar";
  const [theme, setTheme] = useState(storedTheme);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("bstheme", theme);
    const url = `/bootstrap/${
      theme == "dark" ? "solar" : "sandstone"
    }/bootstrap.min.css`;
    document.getElementById("bs_link").setAttribute("href", url);
  }, [theme]);

  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        setSearchQuery={setSearchQuery}
      />
      <CategoriesSidebar partsChanged={partsChanged} />
      <Container className="content-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/part/:id"
            element={<PartView setPartsChanged={setPartsChanged} />}
          />
          <Route path="/category/:id" element={<Category />} />
          <Route
            path="/newpart"
            element={<CreatePart setPartsChanged={setPartsChanged} />}
          />
          <Route path="/search" element={<SearchPage query={searchQuery} />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
