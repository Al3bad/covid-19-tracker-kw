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
const ratio = { width: 16, height: 9 };
const chartLaptop = {
  width: ratio.width * 60,
  height: ratio.height * 60,
  marginX: 40,
  marginY: 25,
};

const chartTablet = {
  width: ratio.width * 47,
  height: ratio.height * 47,
  marginX: 40,
  marginY: 25,
};

const chartMobile = {
  width: ratio.width * 32,
  height: ratio.height * 32,
  marginX: 20,
  marginY: 20,
};

const chartMobileSl = {
  width: ratio.width * 23,
  height: ratio.height * 35,
  marginX: 20,
  marginY: 20,
  marginRight: 15,
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

  changeChartSettings();
  window.addEventListener("resize", changeChartSettings);
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
    .then((res) => {
      console.log(res);
      // location.reload()
    });
};

// =============================== //
// --> Chart Settings Handler <--  //
// =============================== //

const changeChartSettings = () => {
  let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);

  if (vw > 1100) chart = chartLaptop;
  else if (vw > 800) chart = chartTablet;
  else if (vw > 500) chart = chartMobile;
  else chart = chartMobileSl;

  if (chart.width !== currentChart.width) {
    console.log("View has changed!");
    currentChart = chart;
    drawCharts();
  }
};
