import { describe, test, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import { sendEmails } from "./sendPromo";
import { send } from "process";

const sendMailMock = vi.hoisted(() => vi.fn());

vi.mock("fs", () => ({
  readFileSync: vi.fn(() => JSON.stringify({ recipients: ["test@example.com"] })),
}));

vi.mock("nodemailer", () => {
  return {
    createTransport: vi.fn(() => ({
      sendMail: sendMailMock,
    })),
  };
});

async function consoleErrorHelper() {
  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  await sendEmails();
  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
}

describe("sendPromo.ts", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    vi.clearAllMocks();
    process.argv = ["node", "sendPromo.ts", "https://dropbox.com/test", "Test Subject"];
  });

  test("should read recipients from recipients.json", async () => {
    await sendEmails();
    expect(fs.readFileSync).toHaveBeenCalledWith("recipients.json", "utf-8");
  });

  test("should handle missing recipients.json file", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockReadFileSync = vi.mocked(fs.readFileSync);
    mockReadFileSync.mockImplementation(() => {
      throw new Error("No such file or directory");
    });

    await sendEmails();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("should handle empty recipients file", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockReadFileSync = vi.mocked(fs.readFileSync);
    mockReadFileSync.mockReturnValue("");

    await sendEmails();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test("should handle missing recipients property", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const mockReadFileSync = vi.mocked(fs.readFileSync);
    mockReadFileSync.mockReturnValue(JSON.stringify({ notRecipients: ["bob@example.com"] }));

    await sendEmails();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // test("should send an email to each recipient", async () => {
  //   await sendEmails();
  //   expect(sendMailMock).toHaveBeenCalledWith({
  //     from: process.env.EMAIL_USER,
  //     to: "test@example.com",
  //     subject: "Test Subject",
  //     text: "New Circumference music! https://dropbox.com/test",
  //   });
  // });

  // test("should use default subject if none is provided", async () => {
  //   process.argv = ["node", "sendPromo.ts", "https://dropbox.com/test"];
  //   await sendEmails();
  //   expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ subject: "New music!" }));
  // });
});
