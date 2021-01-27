const path = require("path");
const Bundler = require("parcel-bundler");

// =============================== //
// -->  Bundle front-end js   <--  //
// =============================== //

const jsPath = path.join(__dirname, "..", "src", "index.js");
const jsDist = path.join(__dirname, "..", "src", "public");
const options = {
  outDir: jsDist, // The out directory to put the build files in, defaults to dist
};

const bundle = async () => {
  // Initializes a bundler using the entrypoint location and options provided
  const bundler = new Bundler(jsPath, options);

  // Run the bundler, this returns the main bundle
  // Use the events if you're using watch mode as this promise will only trigger once and not for every rebuild
  const bundle = await bundler.bundle();
};

module.exports = bundle;