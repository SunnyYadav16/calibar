import { expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { App } from "./App";

test("App renders the command input", () => {
  expect(renderToString(<App />)).toContain("<input");
});
