import { parentPort, workerData } from "worker_threads";
import { ImapFlow } from 'imapflow'
import { classifyEmail } from "./classifier/mail_classifier";
import { create } from "./elasticsearch";

export async function imap_config({ user, pass}){
    return new Promise((res, rej) => {
        res({
            host: "imap.gmail.com",
            port: 993,
            secure: true,
            auth: {
                user,
                pass
            },
            socketTimeout: 240000
        })
    })
}

export async function start_imap(config){

    
    parentPort!.postMessage(config)
    let c = new ImapFlow(config);

    c.on("error", (err) => {
        console.log("ERROR: ")
        console.log(err)
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
                console.log('EXISTS UPDATE: ' + message.envelope!.subject);
                classifyEmail(message.envelope!.subject as string).then(label => {
                    create("mails", message.envelope!.messageId as string, { ...message.envelope, label });
                }).catch((err) => {
                    console.log("ERROR on classifying mail")
                })
            }
        }).catch(err => {
            return Promise.reject(err)
        });
    });

    c.on('expunge', updateEvent => {
        console.log('EXPUNGE UPDATE');
    });

    // setTimeout(() => {
    //     console.log(c.stats());
    // }, 1000);

    c.connect()
    .then(async () => {
        console.log("CONNECTION ESTABLISHED");

        await c.mailboxOpen('INBOX');

        console.log("FETCHING")

        let date = new Date();
        date.setDate(date.getDate() - 30);

        c.fetchAll({ since: date }, { envelope: true}).then(messages => {
            console.log('FETCH RESULTS');
            for (let message of messages) {
                classifyEmail(message.envelope!.subject as string).then(label => {
                    create("mails", message.envelope!.messageId as string, { ...message.envelope, label });
                }).catch((err) => {
                    console.log("ERROR on classifying mail")
                })
            }
        }).catch(err => {
            return Promise.reject(err)
        });

        c.idle().catch(err => {
            return Promise.reject(err)
        });

    })
    .catch(err => {
        c.close();
        return Promise.reject(err)
    });
}
imap_config(workerData).then((res) => {
    start_imap(res).catch(err => parentPort!.postMessage(err))
}).catch(err => {
    parentPort!.postMessage("error")
})