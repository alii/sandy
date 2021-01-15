import { Page } from "puppeteer-core";
import { App } from "./App";
import * as crypto from "crypto";

export class Window {
  readonly app: App;
  readonly page: Page;
  readonly id = crypto.randomBytes(10).toString("hex").toLowerCase() + "-" + Date.now();

  constructor(app: App, page: Page) {
    this.app = app;
    this.page = page;
  }
}
