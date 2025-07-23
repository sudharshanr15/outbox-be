var express = require('express');
var router = express.Router();

var es = require("../lib/elasticsearch")

const { ImapFlow } = require("imapflow")
const client = new ImapFlow({
    host: "imap.gmail.com",
    port: 993,
    secure: true,
    auth: {
        user: process.env.TEST_IMAP_USER1_USER,
        pass: process.env.TEST_IMAP_USER1_PASS
    }
})

async function startImap(){
    try{
        await client.connect()
        let lock = await client.getMailboxLock('INBOX');
        
        const since = new Date();
        since.setDate(since.getDate() - 1);
        
        let messages = await client.search({ since })

        for(let message of messages){
            let { envelope } = await client.fetchOne(message, { envelope: true });
            es.create("mails", envelope)
        }
        
    }catch(e){
    }finally{
        await client.logout();
    }
}

// es.ping()

// startImap()

/* GET home page. */
router.get('/', async function(req, res, next) {
    let get_all = await es.get_all("mail")
    get_all = JSON.stringify(get_all)

    res.send(get_all)
});

module.exports = router;
