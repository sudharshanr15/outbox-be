import axios from 'axios';

const webhook_url = "https://hooks.slack.com/services/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"

export async function post_message({ subject, from, date }){
    let text = `New mail arrived
Subject: ${subject}
From: **${from[0]['name']}** <${from[0]['address']}>
Date: ${date}
`;

    try{
        await axios.post(webhook_url, {
            text
        })
        return {
            success: true
        }
    }catch(err){
        return {
            success: false
        }
    }
}