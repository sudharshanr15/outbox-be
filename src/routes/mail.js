const { ImapFlow } = require("imapflow")
var express = require('express');
var router = express.Router();
process.env.

const user1 = new ImapFlow({
  host: "imap.gmail.com",
  port: 993,
  secure: true,
  auth: {
    user: process.env.TEST_IMAP_USER1_USER,
    pass: process.env.TEST_IMAP_USER1_PASS
  }
})

/* GET home page. */
router.get('/', async function(req, res, next) {
  try{
    const user_connect = await user1.connect();
    let lock = await user1.getMailboxLock('INBOX');
  }catch(e){
    res.send(e) 
  }


  res.send("hello world")
});

module.exports = router;
