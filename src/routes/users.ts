import { post_message } from "../lib/slack";
import { sendResponse } from "../utils/utils"

var express = require('express');
var router = express.Router();


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
