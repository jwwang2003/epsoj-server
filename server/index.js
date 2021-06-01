// ignore style imports
require("ignore-styles");

// transpile imports on the fly
require("@babel/register")({
  ignore: [/(node_module)/],
  presets: ["@babel/preset-env", "@babel/preset-react"],
  plugins: [
    "@babel/plugin-transform-runtime",
  ],
});

require("./server.js");
