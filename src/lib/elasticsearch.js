const es = require("@elastic/elasticsearch")

const client = new es.Client({
    node: "http://localhost:9200",
    auth: {
        apiKey: "R0xVaU41Z0JaaFdJRm82WDI0eHk6RDZNV2VsX0J6bU5sN0NDbEVEd0RtQQ=="
    }
})

async function ping(){
    client.ping({
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
  await client.index({
    index,
    document
  });
}

async function get_all(index){
    try{
        const res = await client.search({
            index,
            query: {
                match_all: {}
            }
        })
        
        return {
            status: true,
            data: res
        }
    }catch(e){
        return {
            status: false
        }
    }
}

module.exports = {
    ping,
    create,
    get_all
}