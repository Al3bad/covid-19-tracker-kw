const http = require("http");
const path = require("path");
const fs = require("fs");

const ejs = require("ejs");

const bundler = require("./backend/bundler");
const Case = require("./backend/database");
const init = require("./backend/resetDB");
const logger = require("./backend/logger");

// Server configuration
const hostname = process.env.HOST || "127.0.0.1";
const port = process.env.PORT || 3000;

// =============================== //
// -->   Reading public dir   <--  //
// =============================== //

// read all static files
logger.task("Reading public directory ...");
const staticFilesArr = fs.readdirSync("./src/public");
console.log("Static Files: ", staticFilesArr);
logger.seperator();

// =============================== //
// -->         Server         <--  //
// =============================== //

// Server Intance
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${port}/`);
  const query = new URLSearchParams(parsedUrl.search); // use `query.get(<key>)` to get the value of that key
  const pathname = parsedUrl.pathname;

  const headers = req.headers;
  const method = req.method.toLowerCase();

  let body = [];

  // =============================== //
  // -->   Serve static files   <--  //
  // =============================== //

  const mimeLookup = {
    ".js": "application/javascript",
    ".map": "application/json",
    ".css": "text/css",
  };

  if (staticFilesArr.includes(pathname.slice(1))) {
    const filePath = path.join(__dirname, "src", "public", pathname.slice(1));
    const fileExtention = path.extname(pathname.slice(1));
    const mimeType = mimeLookup[fileExtention];

    try {
      if (!mimeType) throw { statusCode: 404, errorMessage: "Not Found" };
      const fileContent = fs.readFileSync(filePath, "utf8");

      res.writeHead(200, { "Content-Type": mimeType });
      return res.end(fileContent);
    } catch (err) {
      console.log(pathname + " : Not Found!");
      res.writeHead(302, { Location: "/404" });
      return res.end();
    }
  }

  // =============================== //
  // -->   Handle other routes  <--  //
  // =============================== //

  req
    .on("error", (err) => {
      console.error(err);
    })
    .on("data", (chunk) => {
      body.push(chunk);
    })
    .on("end", async () => {
      body = Buffer.concat(body).toString();
      try {
        body = JSON.parse(body);
      } catch (err) {
        body = null;
      }

      logger.pathname(pathname);

      // other routes
      const chosenHandler = router[pathname];
      if (!chosenHandler) {
        res.writeHead(302, { Location: "/404" });
        return res.end();
      }
      const data = { pathname, query, method, headers, body };

      chosenHandler(data, (statusCode, payload) => {
        statusCode = typeof statusCode === "number" ? statusCode : 200;
        let payloadStr = "";
        let headers = {};
        if (typeof payload === "string") {
          headers["Content-Type"] = "text/html";
          payloadStr = payload;
        } else if (typeof payload === "object") {
          headers["Content-Type"] = "application/json";
          payloadStr = JSON.stringify(payload);
        } else {
          headers["Content-Type"] = "application/json";
          payloadStr = JSON.stringify({});
        }

        console.log("Status Code: ", statusCode);
        console.log("Headers: ", headers);

        res.writeHead(statusCode, headers);
        res.end(payloadStr);

        logger.seperator();
      });
    });
});

// =============================== //
// -->   Spin up the server   <--  //
// =============================== //

server.listen(port, hostname, async () => {
  if (process.env.NODE_ENV === "development") {
    logger.task("Bundling front-end js ...");
    await bundler();
    logger.seperator();
  }
  logger.task("Creating/Reseting mySQL table ...");
  await init();
  logger.seperator();
  logger.task(`Server running at http://${hostname}:${port}/  (${process.env.NODE_ENV} environment)`);
  logger.seperator();
});

// =============================== //
// -->     Routes handlers    <--  //
// =============================== //

const handlers = {};

handlers.home = async (data, callback) => {
  try {
    if (data.method !== "get") throw { statusCode: 404, errorMessage: "Not Found" };

    const ejsTemplate = path.join(__dirname, "src", "ejs", "index.ejs");

    const ejsData = await readFileAsync(ejsTemplate);

    const title = "COVID-19 Cases";
    const currentDate = new Date().toISOString().slice(0, 10);

    const result = await Case.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [["date", "DESC"]],
      limit: 1,
      raw: true,
    });

    const today = result[0];
    const date = new Date(today.date);
    today.date = date.toGMTString().slice(0, 16);;

    console.log(today);

    // set res body
    let html = ejs.render(ejsData, { title, today });
    callback(200, html);
  } catch (err) {
    callback(err.statusCode || 500, { error: err.errorMessage || "Server Error" });
  }
};

handlers.getCases = async (data, callback) => {
  try {
    if (data.method !== "get") throw { statusCode: 404, errorMessage: "Not Found" };
    const cases = await Case.findAll({ attributes: { exclude: ["createdAt", "updatedAt"] }, order: [["date", "ASC"]] });
    callback(200, cases);
  } catch (err) {
    callback(err.statusCode || 500, { error: err.errorMessage || "Server Error" });
  }
};

handlers.addRecord = async (data, callback) => {
  try {
    if (data.method !== "post") throw { statusCode: 404, errorMessage: "Not Found" };

    const { date, newCases, newDeaths, newRecoveries, newTests, activeCases, icu } = data.body;
    const body = [date, newCases, newDeaths, newRecoveries, newTests, activeCases, icu];

    body.forEach((val) => {
      if (val === undefined || val === null || val === "") {
        console.log(val + " is invalid");
        throw { statusCode: 400, errorMessage: "Not enough information" };
      }
    });
    const rowExists = await Case.findOne({ where: { date }, raw: true });

    console.log("Data Exists? : ", rowExists ? true : false);
    if (rowExists) throw { statusCode: 400, errorMessage: "Data for this date already exists" };
    else {
      await Case.create(data.body);
      callback(201, { msg: "New record was added!" });
    }
  } catch (err) {
    callback(err.statusCode || 500, { error: err.errorMessage || "Server Error" });
  }
};

handlers.notFound = async (data, callback) => {
  try {
    const notFoundPage = path.join(__dirname, "src", "public", "404.html");
    const data = await readFileAsync(notFoundPage);
    callback(404, data);
  } catch (err) {
    callback(err.statusCode || 500, { error: "Server Error" });
  }
};

// Define request route
const router = {
  "/": handlers.home,
  "/404": handlers.notFound,
  "/api/cases": handlers.getCases,
  "/api/add-record": handlers.addRecord,
};

// Function that reads files asynchronously
const readFileAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) reject({ statusCode: 500, errorMessage: "Server Error" });
      resolve(data);
    });
  });
};
