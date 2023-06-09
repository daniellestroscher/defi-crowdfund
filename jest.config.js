module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    //"^.+\\.css$": ["jest-transform-css", { modules: true }]
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  globals: {
    "ts-jest": {
      babelConfig: {
        presets: ["@babel/preset-react"],
      },
    },
  },
  moduleNameMapper: {
    //"\\.css$": "<rootDir>/__mocks__/styleMock.js", // Map CSS file imports to an empty module
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "^(\\.\\.?\\/.+)\\.jsx?$": "$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};
