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

        client.on('exists', async () => {
            let {envelope}: any = await client.fetchOne('*', { envelope: true });
            let label: string = await classifyEmail(envelope.subject)
            create("mails", envelope.messageId, {
                ...envelope,
                label
            })
        });

        console.log("listening to new connections...")
        
    }catch(e){
    }
}