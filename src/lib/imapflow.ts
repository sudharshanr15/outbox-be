import { ImapFlow } from "imapflow";
import { classifyEmail } from "./classifier/mail_classifier";
import { create } from "./elasticsearch";

export async function startImap({ account }){
    const client = new ImapFlow({
        host: "imap.gmail.com",
        port: 993,
        secure: true,
        auth: {
            user: account.user,
            pass: account.pass
        }
    })

    try{
        await client.connect()
        let lock = await client.getMailboxLock('INBOX');
        
        const since = new Date();
        since.setDate(since.getDate() - 1);
        
        let messages: any = await client.search({ since })

        for(let message of messages){
            let { envelope }: any = await client.fetchOne(message, { envelope: true });
            let label: string = await classifyEmail(envelope.subject)
            create("mails", envelope.messageId, {
                ...envelope,
                label
            })
        }

        let keepAliveInterval = setInterval(keepAlive, 5 * 60 * 1000);

        client.on('exists', async () => {
            let {envelope}: any = await client.fetchOne('*', { envelope: true });
            let label: string = await classifyEmail(envelope.subject)
            create("mails", envelope.messageId, {
                ...envelope,
                label
            })
        });

        client.on('close', async () => {
            console.log("Connection closed, reconnecting...");
            await reconnect();
        });

        console.log("listening to new connections...")

        async function reconnect() {
            try {
                await client.logout();
            } catch {}
            await client.connect();
        }

        async function keepAlive() {
            try {
                await client.noop();
            } catch (e) {
                console.error("Keep-alive failed, reconnecting...", e);
                await reconnect();
            }
        }
        
    }catch(e){
    }
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