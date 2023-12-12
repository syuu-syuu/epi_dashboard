import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link className="navbar-brand" to="/">&nbsp; &nbsp; EPI Dashboard</Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown"
                    aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNavDropdown">
                <ul className="navbar-nav mr-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/">Home</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/bubble">Bubble Chart</Link> 
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="https://opal.ils.unc.edu/~albao/inls-641/final/alicia/">Scatterplot Comparison</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link" to="/world-map">World Map</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;