# Outbox

A Node.js backend application for fetching, classifying, and indexing emails using IMAP and Elasticsearch.

## Features

- Connect to Gmail (or any IMAP-compatible server) using secure IMAP
- Support for multiple email accounts with persistent IDLE connection
- Fetch and process new emails in real-time
- Automatically classify emails using a trained machine learning model
- Label emails as: `Interested`, `Not Interested`, `Spam`, `Meeting Booked`, or `Out Of Office`
- Store and index emails using Elasticsearch for fast and powerful search
- Emit new email events to frontend via WebSocket
- Automatically send Slack notifications for emails labeled as `Interested`
- Trigger custom webhooks on specific email labels
- Provide API endpoints for frontend to fetch emails and account data

## Architecture

- **`imapflow`**  
  Connects to multiple Gmail accounts using IMAP IDLE for real-time email fetching.

- **`natural`**  
  Processes and labels each fetched email into categories such as `Interested`, `Not Interested`, `Spam`, `Meeting Booked`, and `Out Of Office`.

- **`Elasticsearch`**  
  Stores and indexes classified emails for fast search and retrieval.

- **`socket.io`**  
  Sends new mail updates to the frontend application in real-time.

- **Automation Hooks (Slack & Webhooks)**  
  Automatically sends details of emails labeled as `Interested` to Slack and webhook endpoints.

- **REST API**  
  Exposes endpoints for frontend to interact with stored emails and account info.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [Elasticsearch](https://www.elastic.co/elasticsearch/)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sudharshanr15/outbox-be.git
   cd outbox-be/
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

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:5000](http://localhost:3000) in your browser.


6. **Front-end Interface**
    The front-end web application is maintained on a separate repository. You can find the source code here:
    ```
    https://github.com/sudharshanr15/outbox-fe.git
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

