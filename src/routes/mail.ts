import { Request, Response } from "express";
import { get_all_mails, create, get_user_mails, get_user_label_mails } from "../lib/elasticsearch";

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
            let label: string = await classifyEmail(envelope.subject)
            create("mails", envelope.messageId, {
                ...envelope,
                label
            })
        }

        client.on('exists', async () => {
            let {envelope} = await client.fetchOne('*', { envelope: true });
            let label: string = await classifyEmail(envelope.subject)
            create("mails", envelope.messageId, {
                ...envelope,
                label
            })
        });

        console.log("listening to new connections...")
        
    }catch(e){
    }
}

(async() => {
    await loadClassifier()
    for(const mail_user of mail_users){
        await startImap({ account: mail_user })
    }

})()



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

// get mails for a user
router.get("/user/:user", async function(req: Request, res: Response){
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

// get mails for a user based on label
router.get("/user/:user/label/:label", async function(req: Request, res: Response){
    let user = req.params.user;
    let label: string | undefined = req.params.label;

    let valid_labels = ["Spam", "Not Interested", "Interested", "Out Of Office", "Meeting Booked"]

    label = valid_labels.find(el => el.toLowerCase() == label?.toLowerCase())
    if(label == undefined){
        return sendResponse(res, {
            statusCode: 400,
            success: false,
            message: "Label not found"
        });
    }

    let user_mails = await es.get_user_label_mails(user, label)

    sendResponse(res, {
        data: user_mails
    })
})

module.exports = router;
