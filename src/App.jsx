import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { lazy, Suspense } from "react";

const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const WorksPage = lazy(() => import('./pages/WorksPage'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <>
      <Navbar />

      {/* 2. Wrap routes in Suspense to show a fallback while code chunks load */}
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Footer />
    </>
  );
}

export default App;