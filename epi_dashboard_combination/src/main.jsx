import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./Navbar";
import Bubble from "./Bubble";
import WorldMap from "./world-map.jsx";
import Homepage from "./homepage.jsx";
import "./Bubble.css";
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
    <Router>
        <React.StrictMode>
            <Navbar />
            <Routes>
                <Route exact path="/" element={<Homepage />} />
                <Route path="/bubble" element={<Bubble />} />
                <Route path="/world-map" element={<WorldMap />} />
                {/* <Route path="https://opal.ils.unc.edu/~albao/inls-641/final/alicia/"/> */}
            </Routes>
        </React.StrictMode>
    </Router>
);
