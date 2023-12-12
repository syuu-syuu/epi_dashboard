//global variables and default values
let economy = "world";

let year = 2000;
let count = 0;

let x_url = "resources/GIB_raw_na.csv" //epi
let y_url = "resources/country-gdp-per-capita.csv" //weo

let economy_title = "World";
let label_x = "GHG Intensity Trend";
let label_y = "GDP per Capita";
let title = economy_title + " in " + year + ": " + label_x + " vs. " + label_y;

//stats
let corr_coeff = 0;
let r_squared = 0;

//called when add graph is clicked
function createGraph() {
    count++;
    this.name = "vis" + count;
    this[this.name] = new scatterPlot("svg_div");
}

//updates title name
function retitle() {
    title = economy_title + " in " + year + ": " + label_x + " vs. " + label_y;
}

//updates economy value
function setEconomy(group) {
    economy = group;

    const selectElement = document.getElementById("economy-select");
    economy_title = selectElement.options[selectElement.selectedIndex].innerHTML;

    //unsure
    retitle();
};

//sets year value
function setYear(year_input) {
    console.log("rerender reached")
    let slider = document.getElementById("year-slider");
    let output = document.getElementById("year-value");
    output.innerHTML = slider.value;

    year = year_input;
    retitle();
    this[this.name].update();
};

//sets x data
function setEPI(indicator) {
    console.log("epi set")
    x_url = indicator; //epi

    const selectElement = document.getElementById("epi-select");
    const selectedOption = selectElement.options[selectElement.selectedIndex];

    label_x = selectedOption.innerHTML;
    retitle();
};

//sets y data
function setWEO(indicator) {
    console.log("weo set")
    y_url = indicator; //weo

    const selectElement = document.getElementById("weo-select");
    const selectedOption = selectElement.options[selectElement.selectedIndex];

    label_y = selectedOption.innerHTML;
    retitle();
};

function deleteGraph(){
    d3.select(".svg").remove();
}

class scatterPlot {
    constructor(parent_id) {
        this.div_id = parent_id;

        this.height = 300;
        this.width = 300;
        this.margin = 50;

        //tableau10 color scheme
        this.economy_color = d3.scaleOrdinal()
            .domain(["world", "euro-area", "major-advanced", "other-advanced", "ED-A", "ED-E", "LA-C", "ME-CA", "SSA"])
            .range(["#1F77B4", "#FF7F0F", "#2BA02B", "#D62727", "#9467BD", "#8C564C", "#E377C1", "#7F7F7F", "#BCBD21"])

        this.addGraph();
    }

    addGraph() {
        //appends svg only
        this.svg = d3.select("#" + this.div_id).append("svg")
            .attr("height", this.height + 2 * this.margin)
            .attr("width", this.width + 2 * this.margin)
            .attr("class", "svg")
        
        //render
        this.rerender();
    }

    rerender() {
        //data
        //y is gdp
        d3.csv(y_url, d => { //y is weo
            //filter out the years from the dataset
            let years = Object.keys(d).filter(key => !isNaN(parseInt(key)) && parseInt(key) >= 1980)
            return {
                economy: d.country_group,
                iso: d.iso,
                country: d.Country,
                weo_year: years.reduce((acc, year) => {
                    if (years.includes(year) && year >= 1980) {
                        acc[year] = d[year];
                        return acc;
                    }
                }, d => d.iso)
            }
        }).then(data => { //after the promise
            this.filtered_y = data.filter(item => { //y is weo
                //filter to selected
                if (economy == "world") {
                    return true;
                } else {
                    return item.economy == economy;
                }
            })
            console.log("this filtered y", this.filtered_y);
            //processing x aka epi data
            this.x_data = d3.csv(x_url, d => {
                let years = Object.keys(d).filter(key => !isNaN(parseInt(key)) && parseInt(key) >= 1980);
                return {
                    iso: d.iso,
                    country: d.country,
                    epi_year: years.reduce((acc, year) => {
                        if (years.includes(year) && year >= 1980) {
                            acc[year] = d[year];
                            return acc;
                        }
                    }, d => d.iso)
                }
            }).then(data => {
                //uses iso codes included in y data to get matching x data- essentially filtering to economy group still
                let iso = this.filtered_y.map(d => d.iso);

                this.filtered_x = data.filter(d => {
                    if (this.selected_group == "world") {
                        return true;
                    } else {
                        for (let i = 0; i < iso.length; i++) {
                            if (iso[i] == d.iso) {
                                return true;
                            }
                        }
                    }
                });

                //returns 0 on missing values- only numbers
                let x_year_values = this.filtered_x.map(item => item.epi_year);
                let x_values = x_year_values.map(yearData => {
                    let val = yearData[year];
                    let numericVal = parseFloat(val.replace(/,/g, ''));
                    if (isNaN(numericVal)) {
                        return 0;
                    }
                    return numericVal;
                })

                //returns 0 on missing values
                let y_year_values = this.filtered_y.map(item => item.weo_year);
                let y_values = y_year_values.map(yearData => {
                    let val = yearData[year];
                    let numericVal = parseFloat(val.replace(/,/g, ''));
                    if (isNaN(numericVal)) {
                        return 0;
                    }
                    return numericVal;
                })

                //using simple statistics to calculate r^2 and correlation coefficient
                corr_coeff = ss.sampleCorrelation(x_values, y_values);

                let zip = d3.zip(x_values, y_values);

                let linear_model = ss.linearRegression(zip);
                let linear_generator = ss.linearRegressionLine(linear_model)
                r_squared = ss.rSquared(zip, linear_generator);

                //min and maxes calculated for scale somains
                let x_min = ss.min(x_values);
                let x_max = ss.max(x_values);

                let y_min = ss.min(y_values);
                let y_max = ss.max(y_values);

                //scales
                this.x = d3.scaleLinear()
                    .domain([x_min, x_max])
                    .range([0, this.width])
                    .nice()

                this.y = d3.scaleLinear()
                    .domain([y_min, y_max])
                    .range([this.height, 0])
                    .nice()

                //g for holding together graph, axes, and labels
                this.g = this.svg.append("g")
                    .attr("transform", "translate(" + this.margin + ",  " + this.margin + ")")
                    .attr("class", "graph")

                //axes
                this.x_axis = this.g.append("g")
                    .call(d3.axisLeft(this.y).ticks(5));

                this.y_axis = this.g.append("g")
                    .attr("transform", "translate(0, " + this.height + ")")
                    .call(d3.axisBottom(this.x).ticks(5));

                //axis labels
                this.g.append("text")
                    .attr("class", "label")
                    .attr("x", this.width / 2)
                    .attr("y", this.height + this.margin - 13)
                    .text(label_x)
                    .attr("text-anchor", "middle")

                this.g.append("text")
                    .attr("class", "label")
                    .attr("writing-mode", "vertical-lr") //turns the axis labels
                    .attr("x", -this.margin + 5)
                    .attr("y", this.height / 2)
                    .text(label_y)
                    .attr("text-anchor", "middle")

                this.g.append("text")
                    .attr("class", "label")
                    .attr("id", "title")
                    .attr("x", 0)
                    .attr("y", -10)
                    .text(title)

                this.g.append("text")
                    .attr("class", "label")
                    .attr("id", "rSquared")
                    .attr("x", 0)
                    .attr("y", this.height + this.margin / 2)
                    .text("R2: " + r_squared.toFixed(2));

                this.g.append("text")
                    .attr("class", "label")
                    .attr("id", "corrCoeff")
                    .attr("x", 0)
                    .attr("y", this.height + this.margin * 0.75)
                    .text("Correlation: " + corr_coeff.toFixed(2));

                //dots!
                let circles = this.g.selectAll(".dot").data(this.filtered_y, d => d.iso); //y is weo

                circles.join( //y is weo
                    enter => enter.append("circle")
                        .style("fill", d => this.economy_color(d.economy))
                        .style("fill-opacity", 0)
                        .attr("r", 4)
                        .attr("class", "dot")
                        .attr("cy", (d, i) => {
                            let weoYearValue = d.weo_year[year];
                            let cleanValue = parseFloat(weoYearValue.replace(/,/g, ''));
                            let cyValue = this.y(cleanValue);
                            return !isNaN(cyValue) ? cyValue : null;
                        })
                        .attr("data-tippy-content", d => {
                            let html = "<table>" 
                            + "<tr><th colspan='2'>Country: " + d.country + "</th></tr>"
                            + "<tr><td>Economy:</td><td>" + d.economy + "</td></tr>"
                            + "</table>"
                            return html;
                        })
                        .call(selection => tippy(selection.nodes(), {allowHTML: true}))
                        .transition(300).style("fill-opacity", 1),
                    update => update.transition(300),
                    exit => exit.transition(300).style("fill-opacity", 0)
                        .remove()
                )

                this.g.selectAll(".dot") //x is epi
                    .data(this.filtered_x, d => d.iso)
                    .attr("cx", d => {
                        let epiYearValue = d.epi_year[year];
                        let cleanValue = parseFloat(epiYearValue.replace(/,/g, ''));
                        let cxValue = this.x(cleanValue);
                        return !isNaN(cxValue) ? cxValue : null;
                    })
            })

        })
    }

    update() {
        let circles = this.g.selectAll(".dot").data(this.filtered_y, d => d.iso); //y is weo                
        circles.join( //y is weo
            enter => enter.append("circle")
                .attr("cy", (d, i) => {
                    let weoYearValue = d.weo_year[year];
                    let cleanValue = parseFloat(weoYearValue.replace(/,/g, ''));
                    let cyValue = this.y(cleanValue);
                    return !isNaN(cyValue) ? cyValue : null;
                }).transition(300).style("fill-opacity", 1),
            update => update.transition(300).style("fill", d => this.economy_color(d.economy)),
            exit => exit.transition(300).style("fill-opacity", 0)
                .remove()
        )
        this.g.selectAll(".dot") //x is epi
            .data(this.filtered_x, d => d.iso)
            .attr("cx", d => {
                let epiYearValue = d.epi_year[year];
                let cleanValue = parseFloat(epiYearValue.replace(/,/g, ''));
                let cxValue = this.x(cleanValue);
                return !isNaN(cxValue) ? cxValue : null;
            })
        this.g.select("#title")
            .text(title)
        this.g.select("#rSquared")
            .text(r_squared.toFixed(2))
        this.g.select("#corrCoeff")
            .text(corr_coeff.toFixed(2))
    }
}