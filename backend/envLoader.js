const PATH = require("path");
const fs = require("fs");

const envLoader = {};

const parse = (src) => {
  const obj = {};
  const NEWLINES_MATCH = /\n|\r|\r\r/;

  src
    .toString()
    .split(NEWLINES_MATCH)
    .forEach((line, id) => {
      const test = line.indexOf("=");

      if (test !== -1) {
        const pair = line.split("=");

        const key = pair[0].trim();
        const val = pair[1].trim();

        obj[key] = val;
      }
    });
  return obj;
};

envLoader.config = (path) => {
  let envPath = PATH.resolve(process.cwd(), ".evn");

  if (path != null) envPath = path;

  try {
    const parsed = parse(fs.readFileSync(envPath, { encoding: "utf8" }));

    Object.keys(parsed).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(process.env, key)) process.env[key] = parsed[key];
      // else console.log(`${key} is already defined in "process.env" and will not be overwritten`);
    });

    return { parsed };
  } catch (e) {
    return { error: e };
  }
};

(function() {
    envLoader.config(process.env.ENV_PATH);
})();
