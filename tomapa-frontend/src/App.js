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
import BOMPage from "./pages/bom_list";
import BOMView from "./pages/bom_view";
import PartScanner from "./pages/part_scanner";

function App() {
  const [partsChanged, setPartsChanged] = useState(0);
  var storedTheme = localStorage.getItem("bstheme");
  if (!!!storedTheme) storedTheme = "light";
  const [theme, setTheme] = useState(storedTheme);

  useEffect(() => {
    document.getElementById("htmlelement").setAttribute("data-bs-theme", theme);
    localStorage.setItem("bstheme", theme);
  }, [theme]);

  const [searchQuery, setSearchQuery] = useState("");

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
          <Route path="/" element={<Home partsChanged={partsChanged} />} />
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
          <Route path="/bom" element={<BOMPage />} />
          <Route path="/bomview/:id" element={<BOMView />} />
          <Route path="/scanner" element={<PartScanner />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
