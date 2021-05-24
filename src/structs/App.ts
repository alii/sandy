import { EventEmitter } from "events";
import TypedEventEmitter from "typed-emitter";
import puppeteer, { Browser, CDPSession } from "puppeteer-core";
import { AppConfig } from "../interfaces";

import findChrome from "chrome-finder";
import path from "path";
import { Window } from "./Window";
import * as fs from "fs";

export interface WindowEvents {
  ready: (time: Date) => void;
}

export class App extends (EventEmitter as { new (): TypedEventEmitter<WindowEvents> }) {
  readonly browser: Browser;
  readonly session: CDPSession;
  readonly windows: Map<string, Window> = new Map();

  constructor(browser: Browser, session: CDPSession) {
    super();
    this.browser = browser;
    this.session = session;
  }

  private async init() {
    await this.browser
      .defaultBrowserContext()
      .overridePermissions("https://domain", [
        "geolocation",
        "midi",
        "notifications",
        "camera",
        "microphone",
        "clipboard-read",
        "clipboard-write",
      ]);

    const pages = await this.browser.pages();

    const window = new Window(this, pages[0]);
    this.windows.set(window.id, window);
  }

  async setIcon(icon: string | Buffer) {
    const buffer = typeof icon === "string" ? await fs.readFileSync(icon) : icon;
    await this.session.send("Browser.setDockTile", { image: buffer.toString("base64") });
  }

  sleep(ms = 5000) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async close() {
    await this.session.detach();
    await this.browser.close();
  }

  static async launch(options?: Partial<AppConfig>) {
    const merged: Omit<AppConfig, "args"> = {
      title: "Sandy",
      chromeExecutablePath: findChrome(),
      localDataDirectory: path.join(__dirname, ".data"),
      backgroundColor: "#ffffff",
      iconPath: "",
      ...options,
    };

    const url = merged.htmlContent ? `data:text/html,${merged.htmlContent}` : merged.url ?? "https://alistair.sh";

    const args: AppConfig["args"] = [
      `--app=${url}`,
      `--enable-features=NetworkService,NetworkServiceInProcess`,
      ...(options?.args ?? []),
    ];

    if (merged?.width && merged?.height) {
      args.push(`--window-size=${merged.width},${merged.height}`);
    }

    if (merged?.left && merged?.top) {
      args.push(`--window-position=${merged.left},${merged.top}`);
    }

    const browser = await puppeteer.launch({
      executablePath: merged.chromeExecutablePath,
      pipe: true,
      headless: false,
      userDataDir: merged.localDataDirectory,
      args,
    });

    const session = await browser.target().createCDPSession();
    const app = new App(browser, session);

    await app.init();

    return app;
  }
}
