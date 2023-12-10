import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

import * as React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import OutlinedInput from "@mui/material/OutlinedInput";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

import "./Bubble.css";
import DATA from "../data/country_data_full.json";
import isoFullName from "../data/isoFullName.json";
import countryColors from "../data/countryColors.json";

const countries = Object.keys(DATA);
const years = Object.keys(DATA[countries[0]]);
const indicatorList = [
  { label: "CDA", value: "CDA" },
  { label: "NDA", value: "NDA" },
  { label: "HAD", value: "HAD" },
  { label: "OZD", value: "OZD" },
  { label: "PMD", value: "PMD" },
  { label: "COE", value: "COE" },
  { label: "NOE", value: "NOE" },
  { label: "VOE", value: "VOE" },
  { label: "SOE", value: "SOE" },
];

const indicatorFullName = {
  CDA: "CO2 Growth Rate",
  NDA: "N2O Intensity Trend",
  HAD: "Household Air Pollution from Solid Fuels",
  OZD: "Ozone exposure",
  PMD: "Ambient Particulate Matter Pollution PM2.5",
  COE: "Air Pollution Levels - CO Exposure",
  NOE: "NOX (NO and N2O)",
  SOE: "SO2 Exposure",
  VOE: "Volatile Organic Compound Exposure (Includes Ethane, Propane, Formaldehyde, and Isoprene)",
};

const initialCountries = ["USA", "CHN", "IND", "DEU", "ZAF", "AUS", "BRA"];

function getFullName(code, type) {
  if (type === "country") {
    return isoFullName[code] || code;
  } else if (type === "indicator") {
    return indicatorFullName[code] || code;
  }
}
function hexToRGBA(hex, alpha = 1) {
  hex = hex.replace(/^#/, "");
  var r = parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const Legend = ({ countryColors, isoFullName, selectedCountries }) => {
  const alpha = 0.6;
  return (
    <div className="legend">
      {Object.entries(countryColors)
        .filter(([countryCode]) => selectedCountries.includes(countryCode))
        .map(([countryCode, color]) => (
          <div key={countryCode} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: hexToRGBA(color, alpha) }}
            ></span>
            <span className="legend-label">{isoFullName[countryCode]}</span>
          </div>
        ))}
    </div>
  );
};

const allGDPValues = Object.values(DATA).flatMap((yearData) =>
  Object.values(yearData).map((countryData) => countryData["GDP"] || 0)
);
const gdpMax = Math.max(...allGDPValues);
const gdpMin = Math.min(...allGDPValues, 0);

const allPopulationValues = Object.values(DATA).flatMap((yearData) =>
  Object.values(yearData).map((countryData) => countryData["Population"] || 0)
);
const populationMax = Math.max(...allPopulationValues);
const populationMin = Math.max(Math.min(...allPopulationValues), 1);

const BubbleRender = {
  dom: null,
  // svg - padding = container
  svg: null,
  innerWidth: 0,
  innerHeight: 0,
  bubbleContainer: null,
  padding: [90, 80, 90, 80],
  xScale: null,
  yScale: null,

  init(dom, data) {
    const { padding } = this;
    this.dom = dom;
    this.dom.innerHTML = "";
    const { clientWidth, clientHeight } = this.dom;

    this.innerWidth = clientWidth - padding[1] - padding[3];
    this.innerHeight = clientHeight - padding[0] - padding[2];

    this.svg = d3
      .select(dom)
      .append("svg")
      .attr("width", clientWidth)
      .attr("height", clientHeight);

    this.xScale = d3
      .scaleLinear()
      .domain([gdpMin, gdpMax])
      .range([0, this.innerWidth])
      .nice();

    this.renderAxes(data);
    this.renderGrid();
    this.renderLines();
    this.renderAxisText(data);
  },

  renderAxes(data, indicator) {
    d3.selectAll(".axis").remove();
    const { padding } = this;
    const { clientWidth, clientHeight } = this.dom;

    const yValues = data.map((item) => item[1]);
    const yMax = Math.max(...yValues);
    const yMin = Math.min(...yValues, 0);

    this.yScale = d3
      .scaleLinear()
      .domain([yMin, yMax])
      .range([this.innerHeight, 0])
      .nice();

    const axisLeft = d3
      .axisLeft(this.yScale)
      .ticks(6)
      .tickFormat(function (d) {
        if (indicator === "CDA" || indicator === "NDA") {
          return `${(d * 100).toFixed(2)}%`; // Format as percent for CDA and NDA
        } else {
          return d.toFixed(2); // Format as decimal for other indicators
        }
      });

    this.svg
      .append("g")
      .attr("class", "axis axisLeft")
      .attr("transform", `translate(${padding[3]},${padding[0]})`)
      .call(axisLeft);

    this.xScale = d3
      .scaleLinear()
      .domain([0, Math.max(...data.map((item) => item[0]))])
      .range([0, this.innerWidth])
      .nice();

    const axisBottom = d3.axisBottom(this.xScale).tickFormat(function (d) {
      return d;
    });

    this.svg
      .append("g")
      .attr("class", "axis axisBottom")
      .attr(
        "transform",
        `translate(${padding[3]},${clientHeight - padding[2]})`
      )
      .call(axisBottom);
  },

  renderAxisText(indicator) {
    console.log(
      "Updating Y-axis label for:",
      getFullName(indicator, "indicator")
    );
    this.svg.selectAll(".axis-text.indicator").remove();

    this.svg
      .append("text")
      .attr("class", "axis-text indicator")
      .attr("x", this.padding[0])
      .attr("y", this.padding[3] - 40)
      .text(getFullName(indicator, "indicator"));

    this.svg
      .append("text")
      .attr("class", "axis-text")
      .attr("x", this.innerWidth + this.padding[3] - 120)
      .attr("y", this.innerHeight + this.padding[0] + 60)
      .text("GDP(Billions Dollars)");
  },
  renderLines() {
    this.hoverLines = this.svg
      .append("g")
      .attr("class", "hover-lines")
      .style("display", "none");

    this.hoverLines
      .append("line")
      .attr("class", "hover-line-x")
      .style("stroke", "red")
      .style("stroke-dasharray", "5,5");

    this.hoverLines
      .append("line")
      .attr("class", "hover-line-y")
      .style("stroke", "red")
      .style("stroke-dasharray", "5,5");
  },

  renderGrid() {
    this.svg
      .append("g")
      .attr("class", "grid-lines")
      .attr(
        "transform",
        `translate(${this.padding[3]}, ${this.innerHeight + this.padding[0]})`
      )
      .call(
        d3
          .axisBottom(this.xScale)
          .ticks(8)
          .tickSize(-this.innerHeight)
          .tickFormat("")
      );

    this.svg
      .append("g")
      .attr("class", "grid-lines")
      .attr("transform", `translate(${this.padding[3]}, ${this.padding[0]})`)
      .call(
        d3
          .axisLeft(this.yScale)
          .ticks(8)
          .tickSize(-this.innerWidth)
          .tickFormat("")
      );
  },

  renderData(data, indicator, populationMax, populationMin) {
    d3.select(".bubble-svg-container").remove();

    this.bubbleContainer = this.svg
      .append("g")
      .attr("transform", `translate(${this.padding[3]},${this.padding[0]})`)
      .attr("class", "bubble-svg-container");
    const { svg, xScale, yScale, padding, dom, bubbleContainer } = this;
    const { clientWidth, clientHeight } = dom;
    const { width, height } = { clientWidth, clientHeight };
    const _this = this;
    const updateBubble = bubbleContainer.selectAll(".bubble").data(data);
    const enterBubble = updateBubble.enter();
    const lineTooltip = d3.select(".lineTooltip");

    enterBubble
      .append("circle")
      .attr("cx", function (d) {
        return xScale(d[0]);
      })
      .attr("cy", function (d) {
        return yScale(d[1]);
      })
      .attr("r", function (d) {
        const minRadius = 1;
        const maxRadius = 80;
        // Create a logarithmic scale for the bubble radius
        // Logarithmic scaling helps to handle wide range of values more effectively
        // by reducing the impact of very large values
        const scale = d3
          .scaleLog()
          .domain([populationMin, populationMax])
          .range([minRadius, maxRadius]);

        return scale(d[2].Population);
      })
      .attr("fill", function (d) {
        return countryColors[d[2].county];
      })
      .attr("opacity", 0.6)
      .attr("class", "bubble")
      .on("mouseover", function (e, d) {
        const x = e.x;
        const y = e.y;

        lineTooltip.attr(
          "style",
          `display:block;left:${e.offsetX + 20}px;top:${e.clientY + 20}px`
        );
        d3.select(".lineTooltip .o").text(d[2].county);
        d3.select(".lineTooltip .t").text(d[0]);
        d3.select(".th").text(d[2][indicator]?.toFixed(2));
        d3.select(".type").text(indicator);

        d3.select(this).attr("opacity", 1);
        _this.renderIndicator(e, d);

        d3.select(".hover-line-x")
          .attr("x1", _this.xScale(d[0]) + _this.padding[3])
          .attr("x2", _this.xScale(d[0]) + _this.padding[3])
          .attr("y1", _this.yScale(d[1]) + _this.padding[0])
          .attr("y2", _this.innerHeight + _this.padding[0]);

        d3.select(".hover-line-y")
          .attr("x1", _this.xScale(d[0]) + _this.padding[3])
          .attr("x2", _this.padding[3])
          .attr("y1", _this.yScale(d[1]) + _this.padding[0])
          .attr("y2", _this.yScale(d[1]) + _this.padding[0]);

        d3.select(".hover-lines").attr("style", "display:block");
      })
      .on("mouseout", function () {
        d3.select(".hover-lines").attr("style", "display:none");
        d3.select(this).attr("opacity", 0.6);
        lineTooltip.attr("style", `display:none`);
      });
  },
  renderIndicator(e, d) {},

  processData(countriesArg = countries, selectedYear, indicator = "CDA") {
    const data = [];
    const missingData = [];

    countriesArg.forEach((country) => {
      if (DATA[country] && DATA[country][selectedYear]) {
        const value = DATA[country][selectedYear][indicator] || 0;
        // Only add to the data array if the value is not zero
        if (value !== 0) {
          data.push([
            DATA[country][selectedYear]["GDP"] || 0,
            value,
            {
              ...DATA[country][selectedYear],
              county: country,
              year: selectedYear,
            },
          ]);
        } else {
          // Add to missing data array if the value is zero
          missingData.push(country);
        }
      }
    });

    return { data, missingData };
  },
};

const Bubble = (props) => {
  const bubbleBox = useRef(null);
  const [selectedCountries, setSelectedCountries] = useState(initialCountries);
  //   const [selectedYear, setSelectedYear] = useState(
  //     Math.min(...years.map((y) => parseInt(y)))
  //   );
  const [selectedYear, setSelectedYear] = useState(2015);
  const [indicator, setIndicator] = useState("CDA");
  const [missingDataCountries, setMissingDataCountries] = useState([]);

  useEffect(() => {
    const { data, missingData } = BubbleRender.processData(
      selectedCountries,
      selectedYear,
      indicator
    );

    setMissingDataCountries(missingData);

    BubbleRender.init.call(
      BubbleRender,
      bubbleBox.current,
      data,
      gdpMax,
      gdpMin
    );
    BubbleRender.renderData(data, indicator, populationMax, populationMin);

    // Update axis
    BubbleRender.renderAxes(data, indicator);

    // Update axis label
    BubbleRender.renderAxisText(indicator);
  }, [bubbleBox, selectedYear, indicator, selectedCountries]);

  const handleChangeCountries = (event) => {
    setSelectedCountries(
      typeof event.target.value === "string"
        ? event.target.value.split(",")
        : event.target.value
    );
  };

  const handleChangeIndicator = (event) => {
    setIndicator(event.target.value);
  };

  const handleSliderChange = (event, newValue) => {
    setSelectedYear(newValue);
  };

  return (
    <div>
      <div className="header">BUBBLE CHART</div>
      <div className="bubble-container">
        {missingDataCountries.length > 0 && (
          <div className="missing-data-message">
            Data is missing for the following countries for the selected year
            and indicator: {missingDataCountries.join(", ")}. Please try another
            year or another indicator!
          </div>
        )}
        <div className="bubble-top">
          <div className="selector">
            <span className="label">YEAR</span>
            <Box sx={{ width: 300 }}>
              <Slider
                size="small"
                value={selectedYear}
                onChange={handleSliderChange}
                valueLabelDisplay="auto"
                aria-label="Year"
                min={Math.min(...years)}
                max={Math.max(...years)}
                getAriaValueText={(value) => `${value}`}
              />
            </Box>
          </div>

          <div className="selector">
            <span className="label">COUNTRIES</span>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel>Countries</InputLabel>
              <Select
                multiple
                value={selectedCountries}
                onChange={handleChangeCountries}
                input={<OutlinedInput label="Countries" />}
                renderValue={(selected) => selected.join(", ")}
              >
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    <Checkbox
                      checked={selectedCountries.indexOf(country) > -1}
                    />
                    <ListItemText primary={isoFullName[country] || country} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="selector">
            <span className="label">INDICATOR</span>
            <FormControl sx={{ m: 1, width: 300 }}>
              <InputLabel id="demo-simple-select-label">Indicator</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={indicator}
                onChange={handleChangeIndicator}
                input={<OutlinedInput label="Indicator" />}
              >
                {indicatorList.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {indicatorFullName[item.value] || item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="bubble-bottom" ref={bubbleBox}></div>
        <Legend
          countryColors={countryColors}
          isoFullName={isoFullName}
          selectedCountries={selectedCountries}
        />
        <div className="lineTooltip">
          <p>
            <span>Country</span>
            <span className="o"></span>
          </p>
          <p>
            <span>GDP</span>
            <span className="t"></span>
          </p>
          <p>
            <span className="type"></span>
            <span className="th"></span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bubble;
