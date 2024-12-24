import { CurrentWeatherData } from "../../types";
import "./CurrentWeather.css";

export default function CurrentWeather({ currentWeather }: { currentWeather: CurrentWeatherData }) {
    return (
        <div className="current-weather">
            <h3>Current Weather</h3>
            <div className="current-weather-info">
                <h2>{currentWeather.city}</h2>
                <div className="current-weather-details-container">
                    <img 
                        src={currentWeather.icon} 
                        alt={currentWeather.description} className="current-weather-icon" 
                    />
                    <div className="current-weather-details">
                        <div className="current-weather-temp">{Math.floor(currentWeather.temperature)}°C</div>
                        <div className="current-weather-description">{currentWeather.description}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}