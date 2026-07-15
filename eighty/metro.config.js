const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The engine is imported as TS source; keep Metro out of its dev toolchain.
config.resolver.blockList = [/engine\/node_modules\/.*/, /engine\/coverage\/.*/];

module.exports = config;
