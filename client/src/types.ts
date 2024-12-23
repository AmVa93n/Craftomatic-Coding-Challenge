export interface User {
    id: string
    username: string
    email: string
    password: string
    image: string
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
    messages: Message[]
    name: string
}

export interface Device {
    id: string;
    type: string;
    latitude: number;
    longitude: number;
}

export interface ForecastData {
    date: string;
    temp_min: number;
    temp_max: number;
    humidity: number;
    description: string;
    icon: string;
}

export interface CurrentWeatherData {
    temperature: number;
    description: string;
    icon: string;
    city: string;
}

export interface WeatherEntry {
    date: string;
    time: string;
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
}

export interface OpenWeatherResponseEntry {
    dt_txt: string;
    main: {
        temp: number;
        humidity: number;
    };
    weather: {
        description: string;
        icon: string;
    }[];
}