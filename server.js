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
      const fileContent = fs.readFileSync(filePath, "utf8");

      res.writeHead(200, { "Content-Type": mimeType });
      return res.end(fileContent);
    } catch (err) {
      console.log(pathname + " : Not Found!");
      res.writeHead(404);
      return res.end({ statusCode: 404, msg: "Not Found!" });
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
      const chosenHandler = router[pathname] ? router[pathname] : handlers.notFound;
      const data = { pathname, query, method, headers, body };

      chosenHandler(data, (statusCode, payload) => {
        statusCode = typeof statusCode === "number" ? statusCode : 200;
        let payloadStr = "";
        if (typeof payload === "string") {
          res.setHeader("Content-Type", "text/html");
          payloadStr = payload;
        } else if (typeof payload === "object") {
          res.setHeader("Content-Type", "application/json");
          payloadStr = JSON.stringify(payload);
        } else {
          res.setHeader("Content-Type", "application/json");
          payloadStr = JSON.stringify({});
        }

        console.log("Status Code: ", statusCode);

        res.statusCode = statusCode;
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

handlers.home = (data, callback) => {
  if (data.method !== "get") callback(404);

  const ejsTemplate = path.join(__dirname, "src", "ejs", "index.ejs");

  fs.readFile(ejsTemplate, "utf8", async (err, data) => {
    if (err) callback(500, { error: err });

    const title = "COVID-19 Cases";
    const currentDate = new Date().toISOString().slice(0, 10);

    const result = await Case.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      order: [["date", "DESC"]],
      limit: 1,
      raw: true,
    });

    const today = result[0];

    console.log(today);

    // set res body
    let html = ejs.render(data, { title, today });
    callback(200, html);
  });
};

handlers.getCases = async (data, callback) => {
  if (data.method !== "get") callback(404);
  try {
    const cases = await Case.findAll({ attributes: { exclude: ["createdAt", "updatedAt"] }, order: [["date", "ASC"]] });
    callback(200, cases);
  } catch (err) {
    callback(500, { error: err });
  }
};

handlers.addRecord = async (data, callback) => {
  if (data.method !== "post") callback(404);
  try {
    // const { newCases, newDeaths, newRecoveries, newTests, activeCases, icu } = data.body;
    await Case.create(data.body);
    callback(201, { msg: "New record was added!" });
  } catch (err) {
    callback(500, { error: err });
  }
};

handlers.notFound = (data, callback) => {
  callback(404);
};

// Define request route
const router = {
  "/": handlers.home,
  "/api/cases": handlers.getCases,
  "/api/add-record": handlers.addRecord,
};
