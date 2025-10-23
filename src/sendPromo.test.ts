import { describe, test, expect, vi, beforeEach } from "vitest";
import * as fs from "fs";
import { sendEmails } from "./sendPromo";

const sendMailMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    response: "250 Message accepted",
    messageId: "test-msg-id",
  })
);

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

describe("sendPromo.ts", () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    vi.clearAllMocks();
    process.argv = ["node", "sendPromo.ts", "https://dropbox.com/test", "Test Subject"];
    process.env.EMAIL_USER = "test@sender.com";
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

  test("should send an email to a recipient", async () => {
    const mockReadFileSync = vi.mocked(fs.readFileSync);
    mockReadFileSync.mockReturnValue(JSON.stringify({ recipients: ["test@example.com"] }));
    await sendEmails();

    expect(sendMailMock).toHaveBeenCalledTimes(1);

    const emailData = sendMailMock.mock.calls[0][0];
    expect(emailData).toHaveProperty("from");
    expect(emailData).toHaveProperty("to", "test@example.com");
    expect(emailData).toHaveProperty("subject");
    expect(emailData).toHaveProperty("text");
    expect(emailData.from).toMatch(/@/);
    expect(emailData.from).toBeTruthy();
  });

  test("should send an email to each recipient", async () => {
    const recipients = ["user1@example.com", "user2@example.com", "user3@example.com"];
    const mockReadFileSync = vi.mocked(fs.readFileSync);
    mockReadFileSync.mockReturnValue(JSON.stringify({ recipients }));

    await sendEmails();
    expect(sendMailMock).toHaveBeenCalledTimes(recipients.length);

    recipients.forEach((expectedRecipient, index) => {
      const emailData = sendMailMock.mock.calls[index][0];
      expect(emailData).toHaveProperty("from");
      expect(emailData).toHaveProperty("to", expectedRecipient);
      expect(emailData).toHaveProperty("subject");
      expect(emailData).toHaveProperty("text");
      expect(emailData.from).toMatch(/@/);
      expect(emailData.from).toBeTruthy();
    });
  });

  // test("should use default subject if none is provided", async () => {
  //   process.argv = ["node", "sendPromo.ts", "https://dropbox.com/test"];
  //   await sendEmails();
  //   expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ subject: "New music!" }));
  // });
});
