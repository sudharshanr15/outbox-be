import { Request, Response } from "express";
import { get_all_mails, create, get_user_mails, get_user_label_mails, search_user_mails } from "../lib/elasticsearch";
import { startImap } from "../lib/imapflow";
import { classifyEmail, loadClassifier } from "../lib/classifier/mail_classifier";
import { sendResponse } from "../utils/utils";

const express = require('express');
const router = express.Router();

(async() => {
    await loadClassifier()
})()


// get all mails
router.get('/', async function(req: Request, res: Response) {
    let get_all = await get_all_mails()

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

router.post("/", async function(req: Request, res: Response){
    try{
        let {users} = req.body

        for(let user in users){
            await startImap({ account: users[user]})
        }

        sendResponse(res, {
            success: true
        })
    }catch(err){
        sendResponse(res, {
            statusCode: 500,
            success: false
        })
    }
});

// get mails for a user
router.get("/user/:user", async function(req: Request, res: Response){
    let user = req.params.user;
    let user_mails = await get_user_mails(user)

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

    let user_mails = await get_user_label_mails(user, label)

    return sendResponse(res, {
        data: user_mails,
        success: true
    })
})

router.get("/user/:user/search/:search", async function(req: Request, res: Response){
    let user = req.params.user;
    let search: string = req.params.search;

    let user_mails = await search_user_mails(user, search)

    return sendResponse(res, {
        data: user_mails,
        success: true
    })
})

module.exports = router;
