import "./App.css";
import { Container } from "react-bootstrap";
import { Route, Routes, useLocation } from "react-router-dom";
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
import AdminPage from "./pages/admin";
import AdminSidebar from "./components/admin_sidebar";

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
  const location = useLocation();

  const [showCategories, setShowCategories] = useState(true);
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);

  useEffect(() => {
    let isAdminPage = location.pathname.match(/admin/g) !== null;
    setShowCategories(!isAdminPage);
    setShowAdminSidebar(isAdminPage);
  }, [location.pathname]);

  return (
    <>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        setSearchQuery={setSearchQuery}
      />
      {showCategories ? (
        <CategoriesSidebar partsChanged={partsChanged} />
      ) : (
        <></>
      )}
      {showAdminSidebar ? <AdminSidebar /> : <></>}
      <Container className={"content-container"}>
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
          <Route path="/admin/:page" element={<AdminPage />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
