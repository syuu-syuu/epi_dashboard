import React, { useState, useEffect } from 'react';
import {
    ComposableMap,
    ZoomableGroup,
    Geographies,
    Geography,
} from 'react-simple-maps';
import Papa from 'papaparse';
import { scaleLinear } from 'd3-scale';
import { interpolateRdYlGn } from 'd3-scale-chromatic';

const WorldMap = () => {
    const [co2Data, setCO2Data] = useState([]);
    const [selectedYear, setSelectedYear] = useState('2008'); // Default selected year

    useEffect(() => {
        const fetchCO2Data = async () => {
            try {
                const response = await fetch('/data/per-capita-emissions.csv');
                const reader = response.body.getReader();
                const result = await reader.read();
                const decoder = new TextDecoder('utf-8');
                const csv = decoder.decode(result.value);

                // Parse CSV data using PapaParse with header: true to treat the first row as headers
                const parsedData = Papa.parse(csv, { header: true });

                // Set the parsed CO2 emission data to state
                setCO2Data(parsedData.data);
            } catch (error) {
                console.error('Error fetching or parsing CO2 data:', error);
            }
        };

        fetchCO2Data();
    }, []);

    const getColorScale = () => {
        const co2Values = co2Data.map((item) => parseFloat(item[selectedYear])).filter((value) => !isNaN(value));

        // Calculate the actual minimum and maximum CO2 values from the dataset
        const minValue = Math.min(...co2Values);
        const maxValue = Math.max(...co2Values);

        // Create a color scale using d3-scale based on the actual range of CO2 emissions
        return scaleLinear()
            .domain([minValue, maxValue])
            .range([interpolateRdYlGn(0), interpolateRdYlGn(1)]);
    };

    const getFillColor = (countryName) => {
        // Find CO2 emission data for the current country by name and selected year
        const countryCO2 = co2Data.find((item) => item['country'] === countryName);

        if (!countryCO2 || isNaN(parseFloat(countryCO2[selectedYear]))) {
            console.warn(`No or invalid CO2 data found for ${countryName}`);
            return '#D3D3D3'; // Fallback color for countries without CO2 data or invalid values (grey color)
        }

        const co2Value = parseFloat(countryCO2[selectedYear]);

        const colorScale = getColorScale();
        // Get color from the color scale based on CO2 value
        return colorScale(co2Value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };


    const yearOptions = [];
    for (let year = 1750; year <= 2019; year++) {
        yearOptions.push(
            <option key={year} value={year.toString()}>
                {year}
            </option>
        );
    }

    return (
        <div style={{ width: '100%', height: '100vh', textAlign: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
                <span style={{ marginRight: '10px' }}>1750</span>
                {/* Replace select with range input */}
                <input
                    type="range"
                    min="1750"
                    max="2019"
                    value={selectedYear}
                    onChange={handleYearChange}
                    style={{ width: '80%', display: 'inline-block' }}
                />
                <span style={{ marginLeft: '10px' }}>2019</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
                <p>Selected Year: {selectedYear}</p>
            </div>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{}}
                style={{ width: '100%', height: 'calc(100% - 80px)' }}
            >
                <ZoomableGroup>
                    <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                        {({ geographies }) =>
                            geographies.map((geo) => {
                                const countryName = geo.properties.name;

                                let fillColor = getFillColor(countryName);

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={fillColor}
                                        stroke="#D6D6DA"
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
};

export default WorldMap;
