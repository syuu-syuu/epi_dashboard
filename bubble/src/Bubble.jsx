import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Select } from "antd";
import { useState } from "react";
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
  padding: [50, 60, 40, 60],
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
    this.renderAxisText();
  },

  renderAxes(data, indicator) {
    d3.selectAll(".axis").remove();
    const { padding } = this;
    const { clientWidth, clientHeight } = this.dom;

    this.yScale = d3
      .scaleLinear()

      .domain([0, Math.max(...data.map((item) => item[1]))])
      .range([this.innerHeight, 0])
      .nice();

    this.xScale = d3
      .scaleLinear()
      .domain([0, Math.max(...data.map((item) => item[0]))])
      .range([0, this.innerWidth])
      .nice();

    const axixBottom = d3.axisBottom(this.xScale).tickFormat(function (d) {
      return d / 100000 + "k";
    });

    const axixLeft = d3
      .axisLeft(this.yScale)
      .ticks(6)
      .tickFormat(function (d) {
        return d * 100;
      });

    this.svg
      .append("g")
      .attr("class", "axis axisBottom")
      .attr(
        "transform",
        `translate(${padding[3]},${clientHeight - padding[2]})`
      )
      .call(axixBottom);

    this.svg
      .append("g")
      .attr("class", "axis axisLeft")
      .attr("transform", `translate(${padding[3]},${padding[0]})`)
      .call(axixLeft);
  },

  renderAxisText() {
    this.svg
      .append("text")
      .attr("class", "axis-text indicator")
      .attr("x", this.padding[0])
      .attr("y", this.padding[3] - 25)
      .text("CDA");

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
      .attr("transform", `translate(60, ${this.innerHeight + 50})`)
      .call(d3.axisBottom(this.xScale).ticks(8).tickSize(-410).tickFormat(""));

    this.svg
      .append("g")
      .attr("class", "grid-lines")
      .attr("transform", `translate(${60},${this.padding[0]})`)
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
      });
  },
  renderIndicator(e, d) {},
  dealWidthData(
    countriesArg = countries,
    yearsArg = ["2005"],
    indicator = "CDA"
  ) {
    const data = [];

    countriesArg.map((country) => {
      yearsArg.map((year) => {
        data.push([
          DATA[country][year]["GDP"] || 1000000,
          DATA[country][year][indicator],
          {
            ...DATA[country][year],
            county: country,
            year,
          },
        ]);
      });
    });
    console.log(data, "data==");
    return data;
  },
};

const Bubble = (props) => {
  const bubbleBox = useRef(null);
  const [countys, setCountries] = useState();
  const [year, setYear] = useState(["2005"]);
  const [indicator, setIndicator] = useState("CDA");

  useEffect(() => {
    const data = BubbleRender.dealWidthData();
    BubbleRender.init.call(BubbleRender, bubbleBox.current, data);
    BubbleRender.renderData(data, indicator);
  }, [bubbleBox]);

  useEffect(() => {
    const data = BubbleRender.dealWidthData(countys, year, indicator);
    BubbleRender.renderAxes(data);
    BubbleRender.renderData(data, indicator);
    d3.select(".indicator").text(indicator + "(%)");
  }, [year, indicator, countys]);

  useEffect(() => {
    const data = BubbleRender.dealWidthData(countys, year, indicator);
    BubbleRender.renderAxes(data);
    BubbleRender.renderData(data, indicator);
    d3.select(".indicator").text(indicator + "(%)");
  }, [year, indicator, countys]);

  return (
    <div>
      <div className="header">BUBBLE CHART</div>
      <div className="bubble-container">
        <div className="bubble-top">
          <div>
            <span className="label">YEAR</span>
            <Select
              mode="multiple"
              value={year}
              options={years.map((item) => {
                return { value: item, label: item };
              })}
              onChange={(value) => {
                setYear(value);
              }}
            />
          </div>
          <div style={{ marginLeft: "30px" }}>
            <span className="label">COUNTRIES</span>
            <Select
              mode="multiple"
              options={countries.map((item) => {
                return {
                  value: item,
                  label: isoFullName[item] || item,
                };
              })}
              value={countys}
              onChange={(value) => {
                console.log(value, "value");
                try {
                  setCountries(value);
                } catch (err) {
                  console.log(err);
                }
              }}
            />
          </div>
          <div style={{ marginLeft: "30px" }}>
            <span className="label">INDICATOR</span>
            <Select
              defaultValue={"CDA"}
              value={indicator}
              options={indicatorList.map((item) => {
                return {
                  value: item.value,
                  label: indicatorFullName[item.value] || item.label,
                };
              })}
              onChange={(value) => {
                console.log(value, "value");
                setIndicator(value);
              }}
            />
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