import { App } from "./src";

App.launch({
  url: "https://discord.com/app",
  width: 1400,
  height: 800,
}).then(async (app) => {
  await new Promise((r) => setTimeout(r, 50000000));
  await app.close();
});
