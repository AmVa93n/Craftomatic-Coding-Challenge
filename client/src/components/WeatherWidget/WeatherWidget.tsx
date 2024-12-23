import { useEffect, useState } from 'react';
import axios from 'axios';
import './WeatherWidget.css';
import { CurrentWeatherData, OpenWeatherResponseEntry, WeatherEntry } from '../../types';
import WeatherForecast from '../WeatherForecast/WeatherForecast';

const API_KEY = '7df7b83b355ae64256679443ad7326d8';

export default function WeatherWidget() {
  const [forecastData, setForecastData] = useState<{ [key: string]: WeatherEntry[] }>({}); // state to store the 5-day forecast data
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null); // state to store the current weather data
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null); // state to store the user's location
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) { // Get the user's current location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Set the location state with the user's latitude and longitude
                setLocation({latitude: position.coords.latitude, longitude: position.coords.longitude});
            },
            (error) => {
                console.error('Error getting location:', error);
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
        if (!location) return;

        async function fetchWeatherData() {
            try {
                // Fetch current weather data based on user's location
                const currentWeatherResponse = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${location?.latitude}&lon=${location?.longitude}&units=metric&appid=${API_KEY}`
                );
                // Extract the relevant data from the response
                const currentWeatherData = {
                    temperature: currentWeatherResponse.data.main.temp,
                    description: currentWeatherResponse.data.weather[0].description,
                    icon: `http://openweathermap.org/img/wn/${currentWeatherResponse.data.weather[0].icon}.png`,
                    city: currentWeatherResponse.data.name
                };
                setCurrentWeather(currentWeatherData);

                // Fetch 5-day forecast data based on user's location
                const forecastResponse = await axios.get(
                    `https://api.openweathermap.org/data/2.5/forecast?lat=${location?.latitude}&lon=${location?.longitude}&units=metric&appid=${API_KEY}`
                );

                // Organize forecast data by day
                const dailyData: { [key: string]: WeatherEntry[] } = {};
                forecastResponse.data.list.forEach((item: OpenWeatherResponseEntry) => {
                    const [date, time] = item.dt_txt.split(' '); // Extract date and time from the response
                    if (!dailyData[date]) dailyData[date] = [];
                    dailyData[date].push({
                        date,
                        time: time.slice(0, 5), // Format time as HH:MM
                        temperature: item.main.temp,
                        humidity: item.main.humidity,
                        description: item.weather[0].description,
                        icon: `http://openweathermap.org/img/wn/${item.weather[0].icon}.png`
                    });
                });
            
                setForecastData(dailyData);
                setSelectedDate(Object.keys(dailyData)[0]); // Set the first date as the default selected date
            } catch (error) {
                console.error('Error fetching weather data:', error);
            }
        };

        fetchWeatherData();
    }, [location]);

  return (
    <div className="weather-widget-page">
        <div className="weather-widget">
            {currentWeather && (
                <div className="current-weather">
                    <h3>Current Weather</h3>
                    <div className="current-weather-info">
                        <h2>{currentWeather.city}</h2>
                        <div className="current-weather-details-container">
                            <img src={currentWeather.icon} alt={currentWeather.description} className="current-weather-icon" />
                            <div className="current-weather-details">
                                <div className="current-weather-temp">{Math.floor(currentWeather.temperature)}°C</div>
                                <div className="current-weather-description">{currentWeather.description}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <h3>5-Day Weather Forecast</h3>
            
            <div className="forecast-navbar">
                {Object.keys(forecastData).map((date, index) => (
                    <button
                        key={index}
                        className={`forecast-tab ${selectedDate === date ? 'active' : ''}`}
                        onClick={() => setSelectedDate(date)}
                    >
                        {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </button>
                ))}
            </div>

            <WeatherForecast forecastData={forecastData} selectedDate={selectedDate} />
            
        </div>
    </div>
  );
};