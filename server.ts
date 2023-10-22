import ejs from "ejs";
import { readdir } from "node:fs/promises";

// const bundler = require("./backend/bundler");
import { createRecordTable, insertRecord, getRecords } from "./backend/db";

// Server configuration
const port = process.env.PORT || 3000;
createRecordTable();
insertRecord({
  $date: "2021-01-01",
  $newCases: 25,
  $newDeaths: 1,
  $newRecoveries: 60,
  $icu: 46,
  $activeCases: 3156,
  $newTests: 4161,
});
insertRecord({
  $date: "2021-01-02",
  $newCases: 28,
  $newDeaths: 2,
  $newRecoveries: 260,
  $icu: 46,
  $activeCases: 3156,
  $newTests: 4161,
});
insertRecord({
  $date: "2021-01-03",
  $newCases: 2,
  $newDeaths: 2,
  $newRecoveries: 260,
  $icu: 46,
  $activeCases: 3156,
  $newTests: 4161,
});

// =============================== //
// -->      Static Files      <--  //
// =============================== //
const initStaticFileServer = async (publicFolderDir: string) => {
  const staticFilesArr = await readdir(publicFolderDir);
  return function (filename: string) {
    if (staticFilesArr.includes(filename)) {
      const file = Bun.file(`./src/public/${filename}`);
      return new Response(file);
    }
    return handlers.notFound();
  };
};
const staticFileServer = await initStaticFileServer("./src/public");

// =============================== //
// -->         Server         <--  //
// =============================== //
const serverBun = Bun.serve({
  port,
  fetch(req) {
    const url = new URL(req.url);
    // routers
    if (url.pathname === "/") return handlers.home.get(req);
    if (url.pathname === "/api/cases") return handlers.api.case.get(req);
    if (url.pathname.includes("/api")) return handlers.api.notFound();
    // static file server
    return staticFileServer(url.pathname.slice(1));
  },
  error(error) {
    // error handler
    return new Response(`<pre>${error}\n${error.stack}</pre>`, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
});
console.log(`Listening on localhost:${serverBun.port}`);

// =============================== //
// -->     Routes handlers    <--  //
// =============================== //

const handlers = {
  home: {
    get: async (_: Request): Promise<Response> => {
      const ejsTemplate = Bun.file(`./src/ejs/index.ejs`).text();

      // const currentDate = new Date().toISOString().slice(0, 10);
      // const result = await Case.findAll({
      //   attributes: { exclude: ["createdAt", "updatedAt"] },
      //   order: [["date", "DESC"]],
      //   limit: 1,
      //   raw: true,
      // });

      // const today = result[0];
      // const date = new Date(today.date);
      // today.date = date.toGMTString().slice(0, 16);

      const title = "COVID-19 Cases";
      const today = new Date().toISOString().slice(0, 10);

      // set res body
      const html = ejs.render(await ejsTemplate, { title, today });
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
  },
  notFound: (): Response => {
    const page = Bun.file("./src/public/404.html");
    return new Response(page, {
      status: 404,
      headers: {
        "Content-Type": "text/html",
      },
    });
  },
  api: {
    case: {
      get: (_: Request): Response => {
        const records = getRecords();
        return new Response(JSON.stringify(records), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    },
    notFound: (): Response => {
      return new Response("Not Found!", { status: 404 });
    },
  },
};

// handlers.getCases = async (data, callback) => {
//   try {
//     if (data.method !== "get")
//       throw { statusCode: 404, errorMessage: "Not Found" };
//     const cases = await Case.findAll({
//       attributes: { exclude: ["createdAt", "updatedAt"] },
//       order: [["date", "ASC"]],
//     });
//     callback(200, cases);
//   } catch (err) {
//     callback(err.statusCode || 500, {
//       error: err.errorMessage || "Server Error",
//     });
//   }
// };
//
// handlers.addRecord = async (data, callback) => {
//   try {
//     if (data.method !== "post")
//       throw { statusCode: 404, errorMessage: "Not Found" };
//
//     const {
//       date,
//       newCases,
//       newDeaths,
//       newRecoveries,
//       newTests,
//       activeCases,
//       icu,
//     } = data.body;
//     const body = [
//       date,
//       newCases,
//       newDeaths,
//       newRecoveries,
//       newTests,
//       activeCases,
//       icu,
//     ];
//
//     body.forEach((val) => {
//       if (val === undefined || val === null || val === "") {
//         console.log(val + " is invalid");
//         throw { statusCode: 400, errorMessage: "Not enough information" };
//       }
//     });
//     const rowExists = await Case.findOne({ where: { date }, raw: true });
//
//     console.log("Data Exists? : ", rowExists ? true : false);
//     if (rowExists)
//       throw {
//         statusCode: 400,
//         errorMessage: "Data for this date already exists",
//       };
//     else {
//       await Case.create(data.body);
//       callback(201, { msg: "New record was added!" });
//     }
//   } catch (err) {
//     callback(err.statusCode || 500, {
//       error: err.errorMessage || "Server Error",
//     });
//   }
// };
