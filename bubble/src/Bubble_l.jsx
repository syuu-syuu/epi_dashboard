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
import DATA from "../data/country_data.json";

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

const countryColors = {
  USA: "#1f77b4",
  CHN: "#ff7f0e",
  IND: "#2ca02c",
  DEU: "#d62728",
  ZAF: "#9467bd",
  AUS: "#8c564b",
  BRA: "#e377c2",
};

const isoFullName = {
  All: "ALL",
  USA: "United States of America",
  CHN: "China",
  IND: "India",
  DEU: "Germany",
  ZAF: "South Africa",
  AUS: "Australia",
  BRA: "Brazil",
};

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

function getFullName(code, type) {
  if (type === "country") {
    return isoFullName[code] || code;
  } else if (type === "indicator") {
    return indicatorFullName[code] || code;
  }
}

const BubbleRender = {
  dom: null,
  // svg - padding = container
  svg: null,
  innerWidth: 0,
  innerHeight: 0,
  bubbleContainer: null,
  padding: [60, 80, 90, 80],
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
      return d / 1000 + "k";
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
      .attr("x", this.innerWidth + this.padding[3] + 15)
      .attr("y", this.innerHeight + this.padding[0] + 5)
      .text("GDP");
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

  renderData(data, indicator) {
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
        if (d[2].Population / 10 < 40) {
          return d[2].Population / 8;
        } else {
          return 45;
        }
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
      })
      .on("click", (event, d) => {
        _this.handleBubbleClick(d[2].country);
      });
  },
  renderIndicator(e, d) {},

  processData(countriesArg = countries, selectedYear, indicator = "CDA") {
    const data = [];

    countriesArg.forEach((country) => {
      if (DATA[country] && DATA[country][selectedYear]) {
        // Check if data for the year exists
        data.push([
          DATA[country][selectedYear]["GDP"] || 1000000,
          DATA[country][selectedYear][indicator],
          {
            ...DATA[country][selectedYear],
            county: country,
            year: selectedYear,
          },
        ]);
      }
    });

    return data;
  },

  drawLineChart(countryCode, indicator) {
    const countryData = years.map((year) => ({
      year: year,
      value:
        DATA[countryCode] && DATA[countryCode][year]
          ? DATA[countryCode][year][indicator]
          : 0,
    }));

    // Clear previous svg content
    this.dom.innerHTML = "";

    // Create new svg element
    this.svg = d3
      .select(this.dom)
      .append("svg")
      .attr("width", this.innerWidth + this.padding[1] + this.padding[3])
      .attr("height", this.innerHeight + this.padding[0] + this.padding[2]);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(countryData.map((d) => d.year))
      .range([0, this.innerWidth])
      .padding(0.1);

    const yMax = d3.max(countryData, (d) => d.value);
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .range([this.innerHeight, 0]);

    // Add X axis
    this.svg
      .append("g")
      .attr(
        "transform",
        `translate(${this.padding[3]},${this.innerHeight + this.padding[0]})`
      )
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(xScale.domain().filter((d, i) => !(i % 5)))
      ); // Show every 5th year

    // Add Y axis
    this.svg
      .append("g")
      .attr("transform", `translate(${this.padding[3]},${this.padding[0]})`)
      .call(d3.axisLeft(yScale));

    // Add the line
    this.svg
      .append("path")
      .datum(countryData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x((d) => xScale(d.year))
          .y((d) => yScale(d.value))
      )
      .attr("transform", `translate(${this.padding[3]},${this.padding[0]})`);
  },
};

const Bubble = (props) => {
  const bubbleBox = useRef(null);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedYear, setSelectedYear] = useState(
    Math.min(...years.map((y) => parseInt(y)))
  );
  const [indicator, setIndicator] = useState("CDA");
  const [selectedCountryCode, setSelectedCountryCode] = useState(null);

  useEffect(() => {
    // Draw line chart when selectedCountryCode or indicator changes
    if (selectedCountryCode) {
      BubbleRender.drawLineChart(selectedCountryCode, indicator);
    }
  }, [selectedCountryCode, indicator]);

  useEffect(() => {
    const data = BubbleRender.processData(
      selectedCountries,
      selectedYear,
      indicator
    );

    BubbleRender.init.call(BubbleRender, bubbleBox.current, data);
    BubbleRender.renderData(data, indicator);
    // Update axis
    BubbleRender.renderAxes(data, indicator);
    // Update axis label
    BubbleRender.renderAxisText(indicator);
    BubbleRender.onCountrySelect = setSelectedCountryData;
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

  const handleBubbleClick = (countryCode) => {
    console.log(`Bubble clicked for country: ${countryCode}`);
    setSelectedCountryCode(countryCode);
    BubbleRender.drawLineChart(countryCode, indicator);
  };
  BubbleRender.handleBubbleClick = handleBubbleClick;

  return (
    <div>
      <div className="header">BUBBLE CHART</div>
      <div className="bubble-container">
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
