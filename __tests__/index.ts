import { App } from "../src";

import * as fs from "fs";
import * as path from "path";

export const icon = fs.readFileSync(path.join(__dirname, "resources", "favicon.ico"));

describe("sandy", () => {
  let app: App;

  beforeAll(async () => {
    app = await App.launch({
      url: "https://discord.com/app",
      width: 700,
      height: 400,
    });
  });

  afterAll(async () => {
    await new Promise((r) => setTimeout(r, 10_000));
    await app.close();
  });

  test("It creates a valid session", () => {
    expect(app.session).toBeTruthy();
  });

  test("Set a valid dock icon", async () => {
    await app.setIcon(icon);

    expect(app).toBeTruthy();
  });
});
