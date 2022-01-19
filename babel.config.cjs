module.exports = {
  presets: [
    [
      "@babel/preset-env",
      { targets: { node: "current" }, shippedProposals: true },
    ],
    ["@babel/preset-typescript", { optimizeConstEnums: true }],
  ],
};
