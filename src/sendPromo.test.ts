import { describe, test, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
// import { sendEmails } from "./sendPromo";

vi.mock("fs", () => ({
  readFileSync: vi.fn(() => JSON.stringify({ recipients: ["test@example.com"] })),
}));

const sendMailMock = vi.fn();
vi.mock("nodemailer", () => ({
  createTransport: vi.fn(() => ({
    sendMail: sendMailMock,
  })),
}));

describe("sendPromo.ts", () => {
  beforeEach(() => {
    vi.resetModules();
    process.argv = ["node", "sendPromo.ts", "https://dropbox.com/test", "Test Subject"];
    sendMailMock.mockClear();
  });

  test("should read recipients from recipients.json", async () => {
    await import("./sendPromo.js");
    expect(fs.readFileSync).toHaveBeenCalledWith("recipients.json", "utf-8");
  });

  test("should send an email to each recipient", async () => {
    await import("./sendPromo.js");
    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to: "test@example.com",
      subject: "Test Subject",
      text: "New Circumference music! https://dropbox.com/test",
    });
  });

  test("should use default subject if none is provided", async () => {
    process.argv = ["node", "sendPromo.ts", "https://dropbox.com/test"];
    await import("./sendPromo.js");
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ subject: "New music!" }));
  });
});
