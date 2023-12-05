class scatterPlot {
    constructor(svg_id) {
        this.svg_id = svg_id;
        this.url_gdp = "data/country-gdp-per-capita.csv";
        this.url_emissions = "data/per-capita-emissions.csv";
        this.svg = d3.select("#" + this.svg_id);
        this.selected_group = "world";
        this.year = 1980;

        //margins
        let height = 500;
        let width = 1000;
        let margin = 40;

        //scales
        //x is gdp, y is emissions
        this.x = d3.scaleLinear()
            .domain([0, 150000])
            .range([margin, 1000 - margin]);

        this.y = d3.scaleLinear()
            .domain([0, 10000])
            .range([500 - margin, 0]);

        //color by economy group
        this.group_color = d3.scaleOrdinal(d3.schemeCategory10);

        //axes
        this.svg.append('g')
            .attr("class", "axis")
            .attr("transform", "translate(30,"+(height-margin+20)+")")
            .call(d3.axisBottom(this.x))
        this.svg.append("text")
            .attr("class", "axis-label")
            .attr("x", 500)
            .attr("y", 525)
            .style("text-anchor", "middle")
            .text("Emissions Per Capita");

        this.svg.append('g')
            .attr("class", "axis")
            .attr("transform", "translate("+(margin+30)+",20)")
            .call(d3.axisLeft(this.y))
        this.svg.append("text")
            .attr("transform", "rotate(90)")
            .attr("class", "axis-label")
            .attr("x", 250)
            .attr("y", -3)
            .style("text-anchor", "middle")
            .text("GDP per Capita");
    }

    setSelection(group) {
        this.selected_group = group;
        this.render();
        console.log("after render", this.selected_group);
    }

    setYear(year) {
        this.year = year;
        this.render();
    }

    render() {
        let slider = document.getElementById("year-slider");
        let output = document.getElementById("year-value");
        output.innerHTML = slider.value;
        console.log("inside render", this.selected_group);

        this.gdp_data = d3.csv(this.url_gdp, d => {
            let years = Object.keys(d).filter(key => !isNaN(parseInt(key)) && parseInt(key) >= 1980);
            return {
                economy_group: d.country_group,
                iso: d.iso,
                country: d.Country,
                gdp_year: years.reduce((acc, year) => {
                    if (years.includes(year) && year >= 1980) {
                        acc[year] = d[year];
                        return acc;
                    }
                }, d => d.iso)
            }
        }
        ).then(data => {
            this.filtered_gdp = data.filter(item => {
                if (this.selected_group == "world"){
                    return true;
                }
                return item.economy_group === this.selected_group;
            }
            )
            this.emissions_data = d3.csv(this.url_emissions, d => {
                let years = Object.keys(d).filter(key => !isNaN(parseInt(key)) && parseInt(key) >= 1980);
                return {
                    iso: d.iso,
                    country: d.country,
                    emissions_year: years.reduce((acc, year) => {
                        if (years.includes(year) && year >= 1980) {
                            acc[year] = d[year];
                            return acc;
                        }
                    }, d => d.iso)
                }
            }
            ).then(emissions => {
                // console.log("raw emissions", emissions)
                let iso_gdp = this.filtered_gdp.map(d => d.iso);
                console.log("isos from gdp ", iso_gdp)
                this.init_emissions = emissions.filter(d => {
                    if (d.emissions_year)
                        if (this.selected_group == "world") {
                            return true;
                        } else {
                            for (let i = 0; i < iso_gdp.length; i++) {
                                if (iso_gdp[i] == d.iso) {
                                    return true;
                                }
                            }
                        }
                });
                let circles = this.svg.selectAll(".dot").data(this.filtered_gdp, d => d.iso);

                circles.join(
                    enter => enter.append("circle")
                        .style("fill", d => this.group_color(d.economy_group))
                        .style("fill-opacity", 0)
                        .attr("r", 5)
                        .attr("class", "dot")
                        .attr("cy", (d, i) => {
                            console.log('year: ', this.year)
                            console.log("gdp", d.gdp_year[this.year]);
                            const gdpYearValue = d.gdp_year[this.year];
                            // console.log('gdp_year value:', gdpYearValue);
                            // const cyValue = this.y(gdpYearValue);
                            this.sanitizedValue = parseFloat(gdpYearValue.replace(/,/g, ''));
                            const cyValue = this.y(this.sanitizedValue);
                            console.log('cy value:', cyValue);

                            // return cyValue;
                            if (!isNaN(cyValue)) {
                                return this.y(cyValue);
                            }
                            // return this.y(cyValue);
                        }).transition(500).style("fill-opacity", 1)
                    ,
                    update => update.transition()
                        .duration(500),
                    exit => exit.transition().duration(500)
                        .style("fill-opacity", 0)
                        .remove()
                )
                this.svg.selectAll(".dot")
                    .data(this.init_emissions, d => d.iso)
                    .attr("cx", d => {
                        const emissionsYear = d.emissions_year[this.year];
                        this.sanitizedEmissions = parseFloat(emissionsYear.replace(/,/g, ''));
                        const cxVal = this.x(this.sanitizedEmissions);
                        if (!isNaN(cxVal)) {
                            return cxVal;
                        }
                    })
                    .attr("data-tippy-content", d => {
                        let html = "<table>" 
                        + "<tr><th colspan='2'>Country: " + d.country + "</th></tr>"
                        + "<tr><td>GDP per Capita:</td><td>" + this.sanitizedValue + "</td></tr>"
                        + "<tr><td>Emissions per Capita:</td><td>" + d.emissions_year[this.year] + "</td></tr>"
                        + "</table>"
                        return html;
                    }).call(selection => tippy(selection.nodes(), {allowHTML: true}))
            })
        })
    }
}

