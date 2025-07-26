import { Server } from "socket.io"

let connection;

class SocketClient{
    socket
    io

    constructor(){
        this.socket = null;
        this.io = null
    }

    connect(server){
        
        if(this.io){
            return
        }
        this.io = new Server(server, {
          cors: {
            origin: "*"
          }
        })
        
        this.io.on("connection", (socket) => {
          this.socket = socket
        })
    }

    static init(server){
        connection = new SocketClient()
        connection.connect(server)
    }

    static getConnection(){
        if(!connection){
            throw new Error("SocketIO not initialized")
        }

        return connection
    }

}

export default {
    connect: SocketClient.init,
    getConnection: SocketClient.getConnection
}