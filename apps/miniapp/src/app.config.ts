export default defineAppConfig({
  pages: [
    "pages/home/index",
    "pages/players/index",
    "pages/events/index",
    "pages/submit/index"
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#0f1720",
    navigationBarTitleText: "中国足球未来之星",
    navigationBarTextStyle: "white"
  },
  tabBar: {
    color: "#667085",
    selectedColor: "#0f7b5f",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    list: [
      { pagePath: "pages/home/index", text: "首页" },
      { pagePath: "pages/players/index", text: "未来之星" },
      { pagePath: "pages/events/index", text: "赛程" }
    ]
  }
});
