import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/ServicesPage";
import WorksPage from "./pages/WorksPage";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { API_BASE_URL } from "./config/api";
import NotFound from "./pages/NotFoundPage";

function App() {
  const [footerData, setFooterData] = useState(null);
  const [footerLoading, setFooterLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/footer-link?populate=*`)
      .then(res => (res.ok ? res.json() : null))
      .then(res => {
        if (res?.data) {
          const data = res.data.attributes ? { id: res.data.id, ...res.data.attributes } : res.data;
          setFooterData(data);
        }
      })
      .catch(err => console.error("Failed to fetch global footer data:", err))
      .finally(() => setFooterLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer data={footerData} loading={footerLoading} />
    </>
  );
}

export default App;