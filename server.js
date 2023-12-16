
const { Database } = require('sqlite3')
const { open } = require('sqlite')

const app = require('./app') 

const { Server } = require('socket.io')
const http = require('http')

const chatHandler = require('./handler/chat')


const setupDatabase = async () => {
    
    const accDb = await open({
        filename: "accounts.db",
        driver: Database
    })

    
    await accDb.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER,
            username TEXT UNIQUE,
            password TEXT,
            PRIMARY KEY(id AUTOINCREMENT)
        )
    `)
    await accDb.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER,
            session TEXT UNIQUE
        )
    `)

    await accDb.close() 

    
    const chatDb = await open({
        filename: "chat.db",
        driver: Database
    })

    
    await chatDb.run(`
        CREATE TABLE IF NOT EXISTS chatlog (
            id INTEGER,
            username TEXT,
            content TEXT,
            timestamp TEXT,
            PRIMARY KEY(id AUTOINCREMENT)
        )
    `)

    await chatDb.close()
}

setupDatabase() 

const server = http.createServer(app) 

const io = new Server(server) 

const clients = {} 

io.on('connection', socket => { 
    socket.on('hello', username => { 
        const usernames = [] 
        Object.keys(clients).forEach(id => { 
            usernames.push(clients[id]) 
        })

        socket.emit('receive users', usernames) 
        chatHandler.joinChat(io, socket, username) 
        
        clients[socket.id] = username 
    })

    socket.on('disconnect', () => { 
        const username = clients[socket.id] 

        chatHandler.leaveChat(io, socket, username) 

        delete clients[socket.id] 
    })

    socket.on('send message', message => { 
        chatHandler.sendMessage(io, message) 
    })
})


const PORT = process.env.PORT || 8080

server.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})
