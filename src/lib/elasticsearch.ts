type FunctionResponse = {
    success: boolean,
    message?: string
    data?: any
}

const elasticsearch = require("@elastic/elasticsearch")

const es_client = new elasticsearch.Client({
    node: "http://localhost:9200",
    auth: {
        apiKey: "R0xVaU41Z0JaaFdJRm82WDI0eHk6RDZNV2VsX0J6bU5sN0NDbEVEd0RtQQ=="
    }
})

async function ping(){
    es_client.ping({
    requestTimeout: 30000,
    }, function (error) {
        if (error) {
            console.error('elasticsearch cluster is down!');
        } else {
            console.log('All is well');
        }
    });
}

async function create(index, document){
  await es_client.index({
    index,
    document
  });
}

async function get_all_mails(): Promise<FunctionResponse>{
    try{
        const res = await es_client.search({
            index: "mails",
            query: {
                match_all: {}
            }
        })
        
        return {
            success: true,
            data: res
        }
    }catch(e){
        return {
            success: false
        }
    }
}

async function get_user_mails(user: string): Promise<FunctionResponse>{
    try{
        const res = await es_client.search({
            index: "mails",
            query: {
                match: {
                    "to.address": user
                }
            }
        })

        return {
            success: true,
            data: res
        }
    }catch(e){
        return { success: false}
    }
}

module.exports = {
    ping,
    create,
    get_all_mails,
    get_user_mails
}