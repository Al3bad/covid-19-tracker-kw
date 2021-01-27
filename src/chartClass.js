import * as d3 from "d3";

// =============================== //
// -->        Base Class      <--  //
// =============================== //

class Chart {
  constructor({ selector, x, y, xLabel, yLabel, color, config }) {
    const { width, height, marginX, marginY, marginTop, marginBottom, marginLeft, marginRight } = config;

    this.tooltipHeight = 45;

    this.selector = selector;
    this.svg = d3.select(selector).attr("width", width).attr("height", height).style("border", "1px solid #CCCCCC9A");

    this.x = x || [0, 1];
    this.y = y || [0, 1];

    this.maxY = d3.max(y, (d) => d);

    this.width = width || 700;
    this.height = height || 350;

    this.marginX = marginX || 50;
    this.marginY = marginY || 35;

    this.marginTop = (marginTop || marginY || 50) + this.tooltipHeight;
    this.marginBottom = marginBottom || marginY || 50;
    this.marginLeft = marginLeft || marginX || 35;
    this.marginRight = marginRight || marginX || 35;

    this._xLabel = xLabel || "x-label";
    this._yLabel = yLabel || "y-label";

    this.yScale = d3
      .scaleLinear()
      .domain([0, this.maxY])
      .range([this.height - this.marginBottom * 2.5, this.marginTop])
      .nice();

    this.xScale = d3
      .scaleTime()
      .domain(d3.extent(x, (d) => d))
      .range([this.marginLeft * 3, this.width - this.marginRight * 2]);

    this.color = d3.rgb(color).darker(0.3) || "gray";
    this.colorHover = color;

    this.dateFormater = d3.timeFormat("%d %b %Y");
  }

  xLabel = (text) => {
    text
      .attr("class", "label")
      .text(this._xLabel)
      .attr("transform", `translate(${this.width / 2}, ${this.height - this.marginBottom})`);
  };

  yLabel = (text) => {
    text
      .attr("class", "label")
      .text(this._yLabel)
      .attr("transform", `translate(${this.marginLeft}, ${this.height / 2}) rotate(-90)`);
  };

  xAxis = (g) =>
    g
      .attr("transform", `translate(${0}, ${this.height - this.marginBottom * 2.5})`) // position of the x Axis group
      .call(d3.axisBottom(this.xScale).ticks(d3.timeDay.every(5))) // format ticks text
      .call((g) => g.select(".domain").remove()); // remove the domain line

  yAxis = (g) =>
    g
      .attr("transform", `translate(${this.marginLeft * 2},${0})`)
      .call(
        d3
          .axisLeft(this.yScale)
          .tickSize(this.marginLeft * 2 + this.marginRight - this.width)
          .tickValues([0, Math.floor(this.maxY * 0.3), Math.floor(this.maxY * 0.6), Math.floor(this.maxY * 0.9)])
      )
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g.selectAll(".tick:not(:first-of-type) line").attr("stroke-opacity", 0.3).attr("stroke-dasharray", "2,2")
      )
      .call((g) => g.selectAll(".tick text").attr("x", 0).attr("dy", -5));

  drawChartVeiw = () => {
    this.svg.node().innerHTML = "";

    this.svg.append("g").call(this.xAxis);
    this.svg.append("g").call(this.yAxis);

    this.svg.append("text").call(this.xLabel);
    this.svg.append("text").call(this.yLabel);
  };

  drawToolTip() {
    const tooltipHeight = this.tooltipHeight;
    const tooltipRoundness = 3;

    const dateOffset = tooltipHeight / 2 / 2;
    const casesOffset = dateOffset * 3;

    const tooltip = d3
      .select(this.selector)
      .append("g")
      .attr("class", "tooltip")
      .attr("opacity", 0)
      .style("pointer-events", "none");

    tooltip
      .append("rect")
      .attr("width", 80)
      .attr("height", tooltipHeight)
      .attr("rx", tooltipRoundness)
      .attr("ry", tooltipRoundness)
      // .attr("x", -3)
      // .attr("y", -10)
      .style("fill", "#eeeeee")
      .style("fill-opacity", 0.9);
    // .style("stroke", "gray")
    // .style("stroke-opacity", 0.5);

    tooltip.append("text").attr("class", "name");
    tooltip
      .append("text")
      .attr("class", "date")
      .attr("x", 3)
      .attr("y", dateOffset + 3);
    tooltip
      .append("text")
      .attr("class", "cases")
      .attr("x", 3)
      .attr("y", casesOffset + 3);
  }

  // Hover handlers
  showDetails = (e, d) => {
    const element = e.target;

    const xVal = d.x || d[0];
    const yVal = d.y || d[1];

    // Show Hover color on the bar
    d3.select(element).attr("fill", this.colorHover);

    // Show tooltip
    const tooltip = d3
      .select(this.selector + " .tooltip")
      .attr("opacity", 1)
      .attr("transform", `translate(${this.xScale(new Date(xVal))}, ${this.yScale(yVal)})`);

    // Substitute the values in the tooltip
    const text1 = d3.select(this.selector + " .tooltip .date").text("Date: " + this.dateFormater(xVal));
    const text2 = d3.select(this.selector + " .tooltip .cases").text("Cases: " + yVal);

    // Calculate & adjust the width of the tooltip
    const boxWidth = 6 + d3.max([text1.node().getComputedTextLength(), text2.node().getComputedTextLength()]);

    d3.select(this.selector + " .tooltip rect").attr("width", boxWidth);

    const originX = boxWidth / 2;
    const originY = this.tooltipHeight;
    const triangleWidth = 15;
    const triangleHeight = 15;

    const midX = originX + triangleWidth - triangleWidth / 2;
    const shift = triangleWidth / 2;

    const polyData = [
      [originX - shift, originY],
      [originX + triangleWidth - shift, originY],
      [midX - shift, originY + triangleHeight],
    ];

    const line = d3.line();
    const trianglePath = line(polyData);

    tooltip.append("path").attr("d", trianglePath).style("fill", "#eeeeee").style("fill-opacity", 0.9);

    tooltip.attr(
      "transform",
      `translate(${this.xScale(new Date(xVal)) - (midX - shift)}, ${this.yScale(yVal) - (originY + triangleHeight)})`
    );
    // .append("circle")
    // .attr("cx", midX - shift)
    // .attr("cy", originY + triangleHeight)
    // .attr("r", 5)
    // .attr("fill", "skyblue");
  };

  clearDetails = (e, d) => {
    const element = e.target;
    d3.select(element).attr("fill", this.color);
    d3.select(this.selector + " .tooltip").attr("opacity", 0);
  };
}

// =============================== //
// -->     Bar Chart Class    <--  //
// =============================== //

class BarChart extends Chart {
  // configuration and data
  constructor({ selector, x, y, xLabel, yLabel, color, config }) {
    super({ selector, x, y, xLabel, yLabel, color, config });

    this.xScaleBand = d3
      .scaleBand()
      .domain(this.x)
      .range([this.marginLeft * 3, this.width - this.marginRight * 2])
      .padding(0.1);
  }

  draw() {
    this.drawChartVeiw();

    // Draw bars
    this.svg
      .append("g")
      .attr("fill", this.color)
      .selectAll("rect")
      .data(
        this.x.map((d, i) => {
          return { x: d, y: this.y[i] };
        })
      )
      .join("rect")
      .attr("class", (b, i) => "bar" + i)
      .attr("x", (d) => this.xScale(new Date(d.x)) - this.xScaleBand.bandwidth() / 2)
      .attr("y", (d) => this.yScale(d.y))
      .attr("rx", 1)
      .attr("height", (d) => this.yScale(0) - this.yScale(d.y))
      .attr("width", this.xScaleBand.bandwidth())
      .on("mouseover", this.showDetails)
      .on("mouseleave", this.clearDetails);

    this.drawToolTip();
  }
}

// =============================== //
// -->    Line Chart Class    <--  //
// =============================== //

class LineChart extends Chart {
  constructor({ selector, x, y, xLabel, yLabel, color, config }) {
    super({ selector, x, y, xLabel, yLabel, color, config });

    this.area = d3
      .area()
      .x((d) => this.xScale(d[0]))
      .y((d) => this.yScale(d[1]))
      .y1(this.yScale(0)) // scale is necessary because chart is inverted
      .curve(d3.curveMonotoneX);

    this.line = this.area.lineX0();

    this.circle = d3.symbol().type(d3.symbolCircle).size(75);
  }

  draw() {
    this.drawChartVeiw();

    // draw chart
    const svgDefs = this.svg.append("defs");
    const mainGradient = svgDefs
      .append("linearGradient")
      .attr("id", `${this.selector.slice(1)}-mainGradient`)
      .attr("gradientTransform", "rotate(90)");

    this.color.opacity = 0.5;
    mainGradient.append("stop").attr("class", "stop-top").attr("offset", "0").style("stop-color", this.color);
    this.color.opacity = 0;
    mainGradient.append("stop").attr("class", "stop-bottom").attr("offset", "1").style("stop-color", this.color);

    // Draw line
    this.color.opacity = 1;
    this.svg
      .append("path")
      .datum(this.x.map((d, i) => [d, this.y[i]]))
      .attr("class", "line")
      .attr("d", this.line)
      .style("stroke", this.color)
      .style("fill", "none");

    // Draw area
    this.svg
      .append("path")
      .datum(this.x.map((d, i) => [d, this.y[i]]))
      .attr("class", "area")
      .attr("d", this.area)
      .style("fill", `url(#${this.selector.slice(1)}-mainGradient)`);

    // Draw Circles (dots)
    this.svg
      .selectAll("path.point")
      .data(this.x.map((d, i) => [d, this.y[i]]))
      .join("path")
      .attr("class", "point")
      .attr("d", this.circle)
      .style("fill", this.color)
      .attr("transform", (k) => `translate(${[this.xScale(k[0]), this.yScale(k[1])]})`)
      .on("mouseover", this.showDetails)
      .on("mouseleave", this.clearDetails);

    this.drawToolTip();
  }
}

export { BarChart, LineChart };
