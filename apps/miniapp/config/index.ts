import type { UserConfigExport } from "@tarojs/cli";

const config: UserConfigExport = {
  projectName: "china-football-future-stars",
  date: "2026-05-29",
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: "src",
  outputRoot: "dist",
  framework: "react",
  compiler: "webpack5",
  mini: {},
  h5: {}
};

export default config;
