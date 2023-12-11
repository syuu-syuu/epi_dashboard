import React, { useEffect } from 'react';
// Bootstrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Bootstrap Bundle JS
import "bootstrap/dist/js/bootstrap.bundle.min";

const HomePage = () => {
    useEffect(() => {
        // Add 'active' class to the custom-margin div on component mount
        document.querySelector('.custom-margin').classList.add('active');
    }, []);

    return (
        <div>
            {/* Your HTML content */}
            <nav className="navbar navbar-expand-lg navbar-light" x>
                <br/><br/><br/><br/><br/><br/>

            </nav>

            {/* Content Section */}
            <div className="container custom-margin">
                <div className="row">
                    <div className="col-md-6">
                        <h1 className="display-5 title" id="bootstap-override">2022 EPI Raw Data <br />Visual Analytics Dashboard</h1>
                        <p className="subtitle">
                            Welcome to the 2022 Environmental Performance Index (EPI) Dashboard, a dynamic
                            platform designed to analyze and understand global environmental data. This project
                            delves into details of EPI raw data from the World Economic Outlook (WEO) Database.
                            Tailored for researchers, students, policymakers, and anyone passionate about
                            environmental insights, this dashboard offers a versatile toolkit to explore trends
                            in environmental performance across various dimensions, regions, and policy units.
                            Dive deep, uncover correlations with socioeconomic factors, and embark on a journey
                            of discovery with this powerful analytical tool.
                        </p>
                        <a className="btn btn-lg" href="alicia/epi-dashboard.html" target="_blank" role="button" style={{ backgroundColor: '#a1c9ff' }}>Get started</a>
                        <a className="btn btn-lg" href="https://epi.yale.edu/about-epi" target="_blank" role="button" style={{ backgroundColor: '#e0eaff' }}>Learn More</a>
                    </div>
                    <div className="col-md-5 d-flex align-items-center">
                        <img src="https://cdn.osxdaily.com/wp-content/uploads/2012/12/usa-at-night-wallpaper.jpeg" alt="global picture" className="custom-image" />
                    </div>
                </div>
            </div>

            {/* Optional JavaScript */}
            {/* Include the scripts at the end of the component */}
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
            <script>
                {`
                document.addEventListener('DOMContentLoaded', function () {
                    document.querySelector('.custom-margin').classList.add('active');
                });
                `}
            </script>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.min.js" integrity="sha256-gOQJIa9+K/XdfAuBkg2ONAdw5EnQbokw/s2b8BqsRFg=" crossOrigin="anonymous"></script>

        </div>
    );
};

export default HomePage;
