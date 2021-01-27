import * as d3 from "d3";
import { BarChart, LineChart } from "./chartClass";

import Pikaday from "pikaday";

// =============================== //
// -->         Pikaday        <--  //
// =============================== //

var picker = new Pikaday({
  field: document.getElementById("date"),
  onSelect: function () {
    console.log(this.getMoment().format("DD MM YYYY"));
  },
});

picker.setDate(new Date());

// =============================== //
// -->           D3           <--  //
// =============================== //

// Global chart settings
const chartLaptop = {
  width: 992,
  height: 558,
  marginX: 50,
  marginY: 35,
};

const chartTablet = {
  width: 752,
  height: 423,
  marginX: 50,
  marginY: 35,
};

const chartMobile = {
  width: 512,
  height: 288,
  marginX: 25,
  marginY: 20,
};

const chartMobileSl = {
  width: 352,
  height: 198,
  marginX: 25,
  marginY: 20,
};

// Fetch the data then draw the charts
let data = [];
let dateArr = [];
let chart = {};
let currentChart = {};

d3.json("/api/cases").then((cases) => {
  // Prepare data
  const minDate = new Date(cases[0].date);
  const maxDate = new Date(cases[cases.length - 1].date);

  // const event = new Date(); // get current date
  // event.setHours(0, 0, 0);  // reset time to 00:00:00
  // console.log(new Date(2021, 0, 26)); // alternative way
  // expected output in this format: Tue Jan 26 2021 00:00:00 GMT+1100 (Australian Eastern Daylight Time)

  dateArr = d3.timeDay.range(new Date("2020-12-31"), maxDate);
  console.log(dateArr[0]);
  console.log(new Date());
  data = dateArr.map((d, i) => {
    return { ...cases[i], date: d };
  });

  let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

  // if (vw > 1100) chart = chartLaptop;
  // else if (vw > 800) chart = chartTablet;
  // else if (vw > 500) chart = chartMobile;
  // else chart = chartMobileSl;

  // currentChart = chart;

  currentChart = chartLaptop;

  console.log(vw, vh);

  // window.addEventListener("resize", (e) => {
  //   vw = window.innerWidth;
  //   vh = window.innerHeight;

  //   if (vw > 1100) chart = chartLaptop;
  //   else if (vw > 800) chart = chartTablet;
  //   else if (vw > 500) chart = chartMobile;
  //   else chart = chartMobileSl;

  //   if (chart.width !== currentChart.width) {
  //     console.log("View has changed!");
  //     currentChart = chart;
  //     drawCharts();
  //   }
  // });

  drawCharts();
});

const drawCharts = () => {
  chart = currentChart;

  // Create bar charts
  const casesChart = new BarChart({
    selector: ".cases-chart",
    config: chart,
    x: data.map((d) => d.date),
    y: data.map((d) => d.newCases),
    xLabel: "Date",
    yLabel: "Cases",
    color: "#80E7FF",
  });

  const deathsChart = new BarChart({
    selector: ".deaths-chart",
    config: chart,
    x: data.map((d) => d.date),
    y: data.map((d) => d.newDeaths),
    xLabel: "Date",
    yLabel: "Deaths",
    color: "#FF5F56",
  });

  const recoveriesChart = new BarChart({
    selector: ".recoveries-chart",
    config: chart,
    x: data.map((d) => d.date),
    y: data.map((d) => d.newRecoveries),
    xLabel: "Date",
    yLabel: "Recoveries",
    color: "#25C940",
  });

  const testsChart = new BarChart({
    selector: ".tests-chart",
    config: chart,
    x: data.map((d) => d.date),
    y: data.map((d) => d.newTests),
    xLabel: "Date",
    yLabel: "Tests",
    color: "#587E8B",
  });

  // Create line charts
  let totalCases = 0;
  const totalCasesChart = new LineChart({
    selector: ".total-cases-chart",
    config: chart,
    x: data.map((d) => d.date),
    y: data.map((d) => (totalCases = totalCases + d.newCases)),
    xLabel: "Date",
    yLabel: "Total Cases",
    color: "#A5A5A5",
  });

  const activeCasesChart = new LineChart({
    selector: ".active-cases-chart",
    config: chart,
    x: data.map((d) => d.date),
    y: data.map((d) => d.activeCases),
    xLabel: "Date",
    yLabel: "Active Cases",
    color: "#80E7FF",
  });

  const icuCasesChart = new LineChart({
    selector: ".icu-chart",
    config: chart,
    x: data.map((d) => d.date),
    y: data.map((d) => d.icu),
    xLabel: "Date",
    yLabel: "Serious Cases",
    color: "#FFBD2D",
  });

  // Draw charts
  casesChart.draw();
  deathsChart.draw();
  recoveriesChart.draw();
  testsChart.draw();

  totalCasesChart.draw();
  activeCasesChart.draw();
  icuCasesChart.draw();
};

// =============================== //
// -->      Form Handler      <--  //
// =============================== //

const form = document.querySelector("form");

form.onsubmit = (e) => {
  e.preventDefault();

  const date = picker.toString("YYYY-MM-DD");
  const newCases = document.getElementById("new-cases").value;
  const newDeaths = document.getElementById("new-deaths").value;
  const newRecoveries = document.getElementById("new-recoveries").value;
  const newTests = document.getElementById("new-tests").value;
  const activeCases = document.getElementById("active-cases").value;
  const icu = document.getElementById("icu").value;
  console.log({ date, newCases, newDeaths, newRecoveries, newTests, activeCases, icu });

  console.log(e);
  fetch("/api/add-record", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, newCases, newDeaths, newRecoveries, newTests, activeCases, icu }),
  })
    .then((res) => res.json())
    .then((res) => location.reload());
};