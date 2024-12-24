const http = require('http');
const socketIo = require('socket.io');
const app = require('../app');
const server = http.createServer(app);
const io = socketIo(server);
const { v4: uuidv4 } = require('uuid');
const { db } = require('./jsondb.config');

io.on('connection', (socket) => {

    // listen for the event 'online' (user stats the app)
    socket.on('online', async (user) => {
        console.log(`${user.username} connected`);
        socket.join(user.id); // join the room identified by user id
        try {
            let chats = await db.getData('/chats')
            const messages = await db.getData('/messages')
            chats = chats.filter(chat => chat.participants.includes(user.id)); // filter only the chats where the user is a participant
            chats = chats.map(chat => { 
                socket.join(chat.id) // join the room identified by chat id
                const messagesInChat = messages.filter(message => message.chatId === chat.id) // filter only the messages that belong to the chat
                return {...chat, messages: messagesInChat}; // add the messages of each chat to the chat object
            });
            io.to(user.id).emit('getChats', chats); // emit the event 'getChats' to the user
            
            const users = await db.getData('/users')
            const usersWithoutSelf = users.filter(u => u.id !== user.id); // get all users except the current user
            io.to(user.id).emit('getUsers', usersWithoutSelf); // emit the event 'getUsers' to the user
        } catch (error) {
            console.log(error);
        }
    });

    // listen for the event 'chat' (user starts a new chat)
    socket.on('chat', async (participants, messageText, chatName) => {
        try {
            const chats = await db.getData('/chats');
            // Check if there is already a chat with the same combination of users
            const existingChat = chats.find(chat => 
                chat.participants.length === participants.length &&
                chat.participants.every(participant => participants.includes(participant))
            );

            if (existingChat) { // do not create duplicate chats
                return;
            }

            const chat = { id: uuidv4(), participants, name: chatName };
            await db.push('/chats[]', chat, true); // create a new chat object in the database
            const message = { id: uuidv4(), sender: participants[0], text: messageText, chatId: chat.id, timestamp: new Date().toISOString() }; 
            await db.push('/messages[]', message, true); // create a new message object in the database for the first message of the chat
            for (let userId of participants) { // emit the event 'newChat' to all users in the chat
                io.to(userId).emit('newChat', {...chat, messages: [message]});
            }
        } catch (error) {
            console.log(error);
        }
    });

    // listen for the event 'addChat' (a new chat is added)
    socket.on('addChat', async (chatId) => {
        socket.join(chatId) // join the room identified by the chat id
    });

    // listen for the event 'message' (user sends a message)
    socket.on('message', async (messageData) => {
        const { sender, text, chatId } = messageData
        const timestamp = new Date().toISOString(); // create a timestamp for the message
        const message = { id: uuidv4(), sender, text, chatId, timestamp }; // create a new message object in the database
        try {
            await db.push('/messages[]', message, true);
            io.to(chatId).emit('newMessage', message); // emit the event 'newMessage' to all users in the chat
        } catch (error) {
            console.log(error);
        }
    });

    // listen for the event 'disconnect' (user leaves the app)
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

});

module.exports = { server };