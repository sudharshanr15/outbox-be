import { Request, Response } from "express";

const express = require('express');
const router = express.Router();

const es = require("../lib/elasticsearch")
const { sendResponse } = require("../utils/utils")
const { classifyEmail, loadClassifier } = require("../lib/classifier/mail_classifier")

const { ImapFlow } = require("imapflow")

const mail_users = [
    {
        user: process.env.TEST_IMAP_USER1_USER,
        pass: process.env.TEST_IMAP_USER1_PASS
    },
    {
        user: process.env.TEST_IMAP_USER2_USER,
        pass: process.env.TEST_IMAP_USER2_PASS
    },
]

async function startImap({ account }){
    const client = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user: account.user,
            pass: account.pass
        }
    })

    try{
        await client.connect()
        let lock = await client.getMailboxLock('INBOX');
        
        const since = new Date();
        since.setDate(since.getDate() - 1);
        
        let messages = await client.search({ since })

        for(let message of messages){
            let { envelope } = await client.fetchOne(message, { envelope: true });
            let label = await classifyEmail(envelope.subject)
            es.create("mails", {
                ...envelope,
                label
            })
        }

        client.on('exists', async () => {
            let latest = await client.fetchOne('*', { envelope: true });
            console.log(`New Email:`, latest.envelope.subject);
        });

        console.log("listening to new connections...")
        
    }catch(e){
    }
}

// (async() => {
//     await loadClassifier()
//     for(const mail_user of mail_users){
//         await startImap({ account: mail_user })
//     }

// })()



// get all mails
router.get('/', async function(req: Request, res: Response) {
    let get_all = await es.get_all_mails()

    if(get_all.success){
        const data = get_all.data.hits
        sendResponse(res, {
            success: true,
            data,
            message: "Mail fetched successfully"
        })
    }else{
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to fetch mails"
        })
    }

});

router.get("/:user", async function(req: Request, res: Response){
    let user = req.params.user;
    let user_mails = await es.get_user_mails(user)

    if(user_mails.success){
        sendResponse(res, {
            success: true,
            data: user_mails,
            message: "User Mail fetched successfully"
        })
    }else{
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: "Failed to fetch mails"
        })
    }
})

module.exports = router;
