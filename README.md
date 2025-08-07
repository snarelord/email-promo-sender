# Email Promo Sender

A Node.js application to email music promo to DJs. The app reads email addresses from a `recipients.json` file and sends an email to each recipient with a specified link to music hosted on Dropbox. This was created to make my life easier.

## Features

- Send personalised emails to multiple recipients.
- Reads email addresses from a `recipients.json` file.
- Supports sending music promo links via Dropbox.
- Uses `nodemailer` to send emails via Gmail's SMTP server.

## Prerequisites

- Node.js (v14 or above)
- Gmail account for sending emails

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/snarelord/email-promo-sender.git
   ```

2. Navigate to the project directory:

   ```bash
   cd email-promo-sender
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Build the files:

   ```bash
   npm run build
   ```

5. Link the package globally so it can be run from anywhere:

   ```bash
   npm link
   ```

6. Create a `.env` file in the root of the project directory and add your Gmail credentials:

   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

7. Create a `recipients.json` file in the root directory with a list of email addresses:

   ```json
   {
     "recipients": ["email1@example.com", "email2@example.com", "email3@example.com"]
   }
   ```

8. Edit the `options` object's text property to reflect your own message:
   ```js
   // email options for each recipient
   const options = {
     from: process.env.EMAIL_USER,
     subject: subject,
     text: `<your message here> ${dropboxLink}`,
   };
   ```

## Usage

To send an email promo with a Dropbox link use the following command anywhere on your system:

1. Run the script with the desired Dropbox link:
   ```bash
   send-promo "https://www.dropbox.com/example" "New music!" etc
   ```

This will send an email to each recipient listed in `recipients.json` with the specified Dropbox link.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
