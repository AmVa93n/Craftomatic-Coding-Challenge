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
            chats = chats.filter(chat => chat.participants.includes(user.id)); // filter chats to get only the chats where the user is a participant
            chats = chats.map(chat => { 
                const messagesInChat = messages.filter(message => message.chatId === chat.id)
                const lastMessage = messagesInChat[messagesInChat.length - 1]; // get the last message in each chat
                return {...chat, lastMessage}; // add the last message of each chat to the chat object
            });
            io.to(user.id).emit('getChats', chats); // emit the event 'getChats' to the user
            
            const users = await db.getData('/users')
            const usersWithoutSelf = users.filter(u => u.id !== user.id); // get all users except the current user
            io.to(user.id).emit('getUsers', usersWithoutSelf); // emit the event 'getUsers' to the user
        } catch (error) {
            console.log(error);
        }
    });

    // listen for the event 'joinChat' (user joins a chat)
    socket.on('joinChat', async (chatId) => {
        socket.join(chatId); // join the room identified by chatId
        try {
            const messages = await db.getData('/messages')
            const messagesInChat = messages.filter(message => message.chatId === chatId); // get all messages in the chat
            io.to(chatId).emit('getMessages', messagesInChat); // emit the event 'getMessages' to the user who joined the chat
        } catch (error) {
            console.log(error);
        }
    });

    // listen for the event 'chat' (user starts a new chat)
    socket.on('chat', async (participants) => {
        try {
            const chats = await db.getData('/chats');
            // Check if there is already a chat with the same combination of users
            const existingChat = chats.find(chat => 
                chat.participants.length === participants.length &&
                chat.participants.every(participant => participants.includes(participant))
            );

            if (existingChat) {
                io.to(participants[0]).emit('newChat', existingChat); // emit the event 'newChat' with the existing chat
                return;
            }

            const chat = { id: uuidv4(), participants }; // create a new chat object in the database
            await db.push('/chats[]', chat, true);
            io.to(participants[0]).emit('newChat', chat); // emit the event 'newChat' only to the user who started the chat (first in the participants array)
        } catch (error) {
            console.log(error);
        }
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