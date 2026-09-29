import { $, expect } from "@wdio/globals";

describe("smoke", () => {
  it("launches the built app and reads the bar", async () => {
    const input = await $("input");
    await input.waitForDisplayed();
    await expect(input).toHaveAttribute("placeholder", "Type a command");
  });
});
