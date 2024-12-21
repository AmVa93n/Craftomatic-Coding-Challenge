const http = require('http');
const socketIo = require('socket.io');
const app = require('../app');
const server = http.createServer(app);
const io = socketIo(server);
const { v4: uuidv4 } = require('uuid');
const { JsonDB, Config } = require('node-json-db');
const db = new JsonDB(new Config('database', true, false, '/'));

io.on('connection', (socket) => {

    // listen for the event 'online' (user stats the app)
    socket.on('online', async (user) => {
        socket.join(user.id); // join the room identified by user id
        try {
            const chats = await db.getData('/chats').filter(chat => chat.participants.includes(user.id)); // get all existing chats that the user is a part of
            io.to(user.id).emit('getChats', chats); // emit the event 'getChats' to the user
        } catch (error) {
            console.log(error);
        }
    });

    // listen for the event 'joinChat' (user joins a chat)
    socket.on('joinChat', async (chatId) => {
        socket.join(chatId); // join the room identified by chatId
        try {
            const messages = await db.getData('/messages').filter(message => message.chatId === chatId); // get all messages in the chat
            io.to(chatId).emit('getMessages', messages); // emit the event 'getMessages' to the user who joined the chat
        } catch (error) {
            console.log(error);
        }
    });

    // listen for the event 'chat' (user starts a new chat)
    socket.on('chat', async (participants) => {
        const chat = { id: uuidv4(), participants }; // create a new chat object in the database
        try {
            await db.push('/chats', chat, true);
        } catch (error) {
            console.log(error);
        }
    });

    // listen for the event 'message' (user sends a message)
    socket.on('message', async (chatId, messageData) => {
        const { sender, text } = messageData
        const timestamp = new Date().toISOString();
        const message = { id: uuidv4(), sender, text, chatId, timestamp }; // create a new message object in the database
        try {
            await db.push('/messages', message, true);
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