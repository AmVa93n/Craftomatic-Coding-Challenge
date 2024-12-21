export interface User {
    id: string
    username: string
    email: string
    password: string
}

export interface Message {
    id: string
    sender: string
    text: string
    timestamp: string
    chatId: string
}

export interface Chat {
    id: string
    participants: string[]
}