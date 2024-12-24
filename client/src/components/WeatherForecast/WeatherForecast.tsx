import './WeatherForecast.css'
import { WeatherEntry } from '../../types'
import useFormat from '../../hooks/useFormat'

interface Props {
    forecastData: { [key: string]: WeatherEntry[] };
    selectedDate: string | null;
}

export default function WeatherForecast({ forecastData, selectedDate }: Props) {
    const { formatDate } = useFormat();

    return (
        <div className="weather-forecast">
            {selectedDate && forecastData[selectedDate] && (
                <div className="weather-day">
                    <div className="weather-date">
                        {formatDate(selectedDate)}
                    </div>
                    
                    {forecastData[selectedDate].map((entry, entryIndex) => (
                        <div key={entryIndex} className="weather-entry">
                            <div className="weather-time">{entry.time}</div>
                            <img src={entry.icon} alt={entry.description} className="weather-icon" />
                            <div className="weather-temp">{Math.floor(entry.temperature)}°C</div>
                            <div className="weather-description">{entry.description}</div>
                            <div className="weather-humidity">{entry.humidity}% 💧</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}