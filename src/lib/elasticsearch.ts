import { post_message } from "./slack"
import { post_webbook } from "./webhook"

type FunctionResponse = {
    success: boolean,
    message?: string
    data?: any
}

const elasticsearch = require("@elastic/elasticsearch")

const es_client = new elasticsearch.Client({
    node: process.env.ELASTIC_SEARCH_HOST,
    auth: {
        apiKey: process.env.ELASTIC_SEARCH_API_KEY
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

export async function create(index: string, id: string, document: any){
  try{
    await es_client.index({
        index,
        id,
        op_type: 'create',
        document
    });
    if(document.label.toLowerCase() == "interested"){
        console.log("sending to slack and webhook.....")
        post_message(document)
        post_webbook(document)
    }
  }catch(error){
    console.log("index already exists")
  }
}

export async function get_all_mails(): Promise<FunctionResponse>{
    try{
        const res = await es_client.search({
            index: "mails",
            query: {
                match_all: {}
            },
            sort: [
                {
                    "date": {
                        "order": "desc",
                    }
                }
            ]
        })
        
        return {
            success: true,
            data: res
        }
    }catch(e){
        return {
            success: false,
            data: e
        }
    }
}

export async function get_user_mails(user: string, from = 1): Promise<FunctionResponse>{
    try{
        const res = await es_client.search({
            index: "mails",
            query: {
                match: {
                    "to.address.keyword": user
                }
            },
            sort: [
                {
                    "date": {
                        "order": "desc",
                    }
                }
            ],
            size: 50,
            from: from
        })

        return {
            success: true,
            data: res
        }
    }catch(e){
        return { success: false}
    }
}


export async function get_user_label_mails(user: string, label: string): Promise<FunctionResponse>{
    try{
        const res = await es_client.search({
            index: "mails",
            query: {
                bool: {
                    must: [
                        {
                            match: {
                                "to.address": user
                            }
                        },
                        {
                            match: {
                                "label.keyword": label
                            }
                        }
                    ]
                }
            },
            sort: [
                {
                    "date": {
                        "order": "desc",
                    }
                }
            ],
            size: 50
        })

        return {
            success: true,
            data: res
        }
    }catch(e){
        return { success: false}
    }
}

export async function search_user_mails(user: string, search: string){
    try{
        const res = await es_client.search({
            index: "mails",
            "query": {
                "bool": {
                    "must": [
                        {
                            "match": {
                                "to.address": user
                            }
                        },
                        {
                            "multi_match": {
                                "query": search,
                                "fields": ["subject", "from.name"]
                            }
                        }
                    ]
                }
            },
            sort: [
                {
                    "date": {
                        "order": "desc",
                    }
                }
            ],
            size: 50
        })

        return {
            success: true,
            data: res
        }
    }catch(e){
        return { success: false}
    }
}