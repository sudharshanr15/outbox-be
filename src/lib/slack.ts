import axios from 'axios';

export async function post_message({ subject, from, date, webhook_url }){
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