const express = require('express');
const path = require('path');
const http = require('http');
const {Server} = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateJoinMessage} = require('../src/utils/messages')
const {addUser, getUsersInRoom, getUser, removeUser} = require('../src/utils/users')
const app = express()
const server = http.createServer(app)
const io = new Server(server)
const port = process.env.PORT || 5000;
const filter = new Filter()
app.use(express.static(path.join(__dirname, '../public')));
app.get('/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

io.on('connection', (socket) => {
    
    socket.on('JOIN', ({username, room, latitude, longitude}, callback)=> {
        
        const {user, error} = addUser({id:socket.id, username, room})
        
        if(error){
            callback(error)
            return
        }
        socket.join(user.room)
        socket.emit('JOINED', {
            text:` Welcome back ${generateJoinMessage(user.username,latitude,longitude).name} from : `, 
            link:generateJoinMessage(user.username,latitude,longitude).mapLink,
            joinedAt : generateJoinMessage(user.username,latitude,longitude).joinedAt
        }
        )
        socket.broadcast.to(user.room).emit('JOINED', {
            text:`${generateJoinMessage(user.username,latitude,longitude).name} joined from : `,
            link: generateJoinMessage(user.username,latitude,longitude).mapLink,
            joinedAt : generateJoinMessage(user.username,latitude,longitude).joinedAt
        }
        )

        io.to(user.room).emit('ROOMINFO', {
            room: user.room,
            allMembers : getUsersInRoom({room : user.room})
        })
        callback()
    });

    socket.on('TEXTING', (content, callback)=> {
        if(filter.isProfane(content)){
            callback({
                message : 'Please avoid profanity!'
            })
        }
        const user = getUser({ id : socket.id })
        io.to(user.room).emit('TEXTED', generateMessage(filter.clean(content), user.username))
    })

    socket.on('disconnect', () => {
        const user  = removeUser({id : socket.id})
        if(user) {
            io.to(user.room).emit('LEFT', `${user.username} just left the room`);
            io.to(user.room).emit('ROOMINFO', {
                room: user.room,
                allMembers : getUsersInRoom({room : user.room})
            })
        }
    })
})


server.listen(port, () => {
    console.log(`Up and running at : http://localhost:${port}`)
})

// process.on('SIGINT', () => {
//     console.log('shuting down all processes');
//     server.close(() => {
//         setTimeout(() => {
//             console.log('Process successfully exited')
//             process.exit(0)
//         }, 5000)
//     })
// })