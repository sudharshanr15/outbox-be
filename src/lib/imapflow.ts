import { ImapFlow, ImapFlowOptions } from "imapflow";
import { classifyEmail } from "./classifier/mail_classifier";
import { create } from "./elasticsearch";

export async function imap_config({ user, pass}): Promise<{}>{
    return {
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user,
            pass
        },
        socketTimeout: 240000
    }
}

export async function start_imap(config){
    const { ImapFlow } = require('imapflow');

    let c = new ImapFlow(config);
    c.on("error", (err) => {
        console.log("ERROR: ")
        c.log.error(err)
    })

    c.on('close', (...args) => {
        console.log('CLOSE');
        console.log('args', ...args);
    });

    c.on('mailboxOpen', (...args) => {
        console.log('MAILBOX:OPEN');
        console.log('args', ...args);
    });

    c.on('mailboxClose', (...args) => {
        console.log('MAILBOX:CLOSE');
        console.log('args', ...args);
    });

    c.on('flags', updateEvent => {
        console.log('FLAGS UPDATE');
    });

    c.on('exists', updateEvent => {
        c.fetchAll("*", { envelope: true}).then(messages => {
            for (let message of messages) {
                console.log('EXISTS UPDATE: ' + message.envelope.subject);
                classifyEmail(message.envelope.subject).then(label => {
                    create("mails", message.envelope.messageId, { ...message.envelope, label });
                })
            }
        }).catch(err => {
            console.error('Update ERROR');
            console.error(err);
        });
    });

    c.on('expunge', updateEvent => {
        console.log('EXPUNGE UPDATE');
    });

    setTimeout(() => {
        console.log(c.stats());
    }, 1000);

    c.connect()
    .then(async () => {
        console.log("CONNECTION ESTABLISHED");

        console.log(c.serverInfo)
        console.log(c.namespace)
        console.log(c.enabled)
        console.log(c.tls)

        await c.mailboxOpen('INBOX');

        console.log("FETCHING")

        let date = new Date();
        date.setDate(date.getDate() - 1);

        c.fetchAll({ since: date }, { envelope: true}).then(messages => {
            console.log('FETCH RESULTS');
            for (let message of messages) {
                classifyEmail(message.envelope.subject).then(label => {
                    create("mails", message.envelope.messageId, { ...message.envelope, label });
                })
            }
        }).catch(err => {
            console.error('FETCH ERROR');
            console.error(err);
        });

        c.idle().catch(err => {
            console.error(err);
        });

    })
    .catch(err => {
        console.error(err);
        c.close();
    });
}

export async function verify_client({ user, pass }){
    try{
        let config = await imap_config({ user, pass });
        const client = new ImapFlow(config as ImapFlowOptions)

        await client.connect()

        return {
            success: true
        }
    }catch(err){
        return {
            success: false
        }
    }
}