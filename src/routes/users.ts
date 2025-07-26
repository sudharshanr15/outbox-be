import { Request, Response } from "express";
import { post_message } from "../lib/slack";
import { sendResponse } from "../utils/utils"
import { imap_config, verify_client } from "../lib/imapflow";
import { Worker } from "worker_threads";
import path from "path";
import { create } from "../lib/elasticsearch";
import socket_client from "../lib/socket_client";

var express = require('express');
var router = express.Router();

router.post("/test", function(req: Request, res: Response){

    let user = req.body.user;
    let pass = req.body.pass;

    const worker = new Worker(path.resolve(__dirname, "../lib/imap_worker.ts"), {
        workerData: {
            user,
            pass
        },
        execArgv: ['-r', 'ts-node/register'] 
    })

    worker.on("message", (data) => {
        console.log(data)
    })
    // worker.on("error", (data) => {
    //     sendResponse(res, {
    //         success: true,
    //         data,
    //     })
    // })

    sendResponse(res, {
        success: true,
        message: "message"
    })

});

router.post("/verify", async function(req: Request, res: Response){
    let user = req.body.user;
    let pass = req.body.pass;

    if(user == undefined || pass == undefined){
        return sendResponse(res, {
            success: false,
            statusCode: 400,
            message: JSON.stringify(req.params),
        })
    }

    const result = await verify_client({ user, pass })
    if(result.success){
        imap_config({ user, pass }).then((config) => {
                const worker = new Worker(path.resolve(__dirname, "../lib/imap_worker.ts"), {
                    workerData: { user, pass },
                    execArgv: ['-r', 'ts-node/register'] 
                })

                worker.on("message", (data: any) => {
                    create(data)
                })
        });

        return sendResponse(res, {
            success: true
        })
    }

    return sendResponse(res, {
        success: false,
        message: "Client not verified",
        data: result
    })
});

/* GET users listing. */
router.post('/slack/send', async function(req, res, next) {
    let date = req.body.date;
    let subject = req.body.subject;
    let from = req.body.from;
    let sender = req.body.sender;
    let replyTo = req.body.replyTo;
    let to = req.body.to;
    let messageId = req.body.messageId;
    let webhook_url = req.body.webhook_url

    if(date == undefined || subject == undefined || from == undefined || sender == undefined || replyTo == undefined || to == undefined || messageId == undefined || webhook_url == undefined){
        return sendResponse(res, {
            success: false,
            statusCode: 400,
            message: "Invalid fields",
        })
    }

    const result = await post_message({ subject, from, date, webhook_url })
    if(result.success){
        return sendResponse(res, {
            success: true
        })
    }

    return sendResponse(res, {
        success: false,
        message: "Unable to send message"
    })
});

module.exports = router;
