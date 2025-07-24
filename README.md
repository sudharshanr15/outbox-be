# Outbox

A Node.js backend application for fetching, classifying, and indexing emails using IMAP and Elasticsearch.

## Features

- Fetch emails from IMAP (Gmail supported)
- Classify emails using a trained classifier and add labels to the envelope
- Index emails in Elasticsearch
- Connect multiple mail accounts with IDLE IMAP support
- Real-time new mail notifications to frontend
- Slack and webhook integration to send automated email on interested labels
- REST API for frontend integration

## Architecture

- The backend makes use of `imapflow` package to connect to an IMAP server `imap.gmail.com` to fetch and classify emails.
- Fetched emails from `imapflow` are stored on Elasticsearch via index.
- Each email envelope is passed to an email classifier using `natural` package to categorize labels into `Interested`, `Not Interested`, `Spam`, `Meeting Booked`, `Out Of Office` 
- Real-time updates (e.g., new mail notifications) are detected using `imapflow` event listeners.
- New emails are stored inside Elasticsearch and sent to slack and webhooks if the label is mentioned as `Interested`
- The frontend (in a separate repo) connects to the backend to display and manage emails.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Elasticsearch](https://www.elastic.co/elasticsearch/)

## Installation

1. **Clone the repository:**

   ```bash
   git clone git@github.com:sudharshanr15/outbox-be.git
   cd outbox/
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Copy the `.env.example` to `.env` file in the project root directory and add your configuration and credentials

   ```bash
   cp .env.example .env
   ```

4. **(Optional) Train the classifier:**
    The application already includes a trained classifier file as `classifier.json`. To train new dataset, run the following command:

   ```bash
   npm run train
   ```
5. **Front-end Interface**
    The front-end web application is maintained on a separate repository. You can find the source code here:
    ```
    git@github.com:sudharshanr15/outbox-fe.git
    ```


## Usage

- **Start the application (Production-mode)**

  ```bash
  npm start
  ```

- **Start the application (Development-mode)**

  ```bash
  npm run start:dev
  ```

## Scripts

- `npm start` — Start the production server
- `npm run start:dev` — Start in development mode
- `npm run build` — Build the TypeScript project
- `npm run train` — Train the email classifier

## Notes

- Make sure your IMAP credentials are correct and that IMAP access is enabled for your email account.
- If using Gmail, you may need to use an App Password and enable IMAP in your Gmail settings.
- Ensure Elasticsearch is running if you want to use email indexing features.

