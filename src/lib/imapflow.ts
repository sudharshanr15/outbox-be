import { ImapFlow } from "imapflow";
import { classifyEmail } from "./classifier/mail_classifier";
import { create } from "./elasticsearch";

export async function init_user({ account }){
    try{
        const client = new ImapFlow({
            host: "imap.gmail.com",
            port: 993,
            secure: true,
            auth: {
                user: account.user,
                pass: account.pass
            }
        })

        client.on('exists', async () => {
            console.log("new email arrived")
            let {envelope}: any = await client.fetchOne('*', { envelope: true });
            let label: string = await classifyEmail(envelope.subject)
            create("mails", envelope.messageId, {
                ...envelope,
                label
            })
        });

        console.log("listening to new connections...")

        return {
            success: true,
            data: client
        }
    }catch(e){
        return {
            success: false,
            message: "Failed to initialize user"
        }
    }
}

export async function startImap({ account }){    
    // try{
    //     let init = await init_user({ account });
    //     if(!init.success) throw new Error(init.message);
    //     const client = init.data as ImapFlow;
        
    //     await client.connect()
    //     let lock = await client.getMailboxLock('INBOX');
        
    //     const since = new Date();
    //     since.setDate(since.getDate() - 30);
        
    //     let messages: any = await client.search({ since })

    //     for(let message of messages){
    //         let { envelope }: any = await client.fetchOne(message, { envelope: true });
    //         let label: string = await classifyEmail(envelope.subject)
    //         create("mails", envelope.messageId, {
    //             ...envelope,
    //             label
    //         })
    //     }

    //     let keepAliveInterval = setInterval(keepAlive, 5 * 60 * 1000);

    //     client.on('exists', async () => {
    //         let {envelope}: any = await client.fetchOne('*', { envelope: true });
    //         let label: string = await classifyEmail(envelope.subject)
    //         create("mails", envelope.messageId, {
    //             ...envelope,
    //             label
    //         })
    //         console.log("new email arrived")
    //     });

    //     client.on('close', async () => {
    //         console.log("Connection closed, reconnecting...");
    //         await reconnect();
    //     });

    //     console.log("listening to new connections...")

    //     async function reconnect() {
    //         try {
    //             await client.logout();
    //         } catch {}
    //         await client.connect();
    //     }

    //     async function keepAlive() {
    //         try {
    //             await client.noop();
    //         } catch (e) {
    //             console.error("Keep-alive failed, reconnecting...", e);
    //             await reconnect();
    //         }
    //     }
        
    // }catch(e){
    //     return {
    //         success: false,
    //         message: "Failed to start IMAP client"
    //     }
    // }

    const client = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user: account.user,
            pass: account.pass
        }
    })
    await client.connect();
    let lock = await client.getMailboxLock('INBOX');
    // try {
    //     const since = new Date();
    //     since.setDate(since.getDate() - 30);
    //     let messages: any = await client.search({ since });

    //     for (let message of messages) {
    //         let { envelope }: any = await client.fetchOne(message, { envelope: true });
    //         let label = await classifyEmail(envelope.subject);
    //         await create("mails", envelope.messageId, { ...envelope, label });
    //     }
    // } finally {
    //     lock.release();
    // }

    client.on('exists', async () => {
        let {envelope}: any = await client.fetchOne('*', { envelope: true });
        let label: string = await classifyEmail(envelope.subject)
        create("mails", envelope.messageId, {
            ...envelope,
            label
        })
        console.log("new email arrived: " + envelope.subject);
    });

    await client.idle();
}

export async function verify_client({ user, pass }){
    try{
        const client = new ImapFlow({
            host: "imap.gmail.com",
            port: 993,
            secure: true,
            auth: {
                user,
                pass
            }
        })

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