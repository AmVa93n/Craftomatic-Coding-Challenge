import LoginPage from './components/LoginPage/LoginPage'
import './App.css'
import ChatPage from './components/ChatPage/ChatPage'
import useAuth from './hooks/useAuth';
import MapPage from './components/MapPage/MapPage';
import WeatherWidget from './components/WeatherWidget/WeatherWidget';
import { useState } from 'react';

function App() {
  const { user } = useAuth();
  const [selectedPage, setSelectedPage] = useState('Live Chat + Auth');
  const pages = ['Live Chat + Auth', 'Device Tracking Map', 'Weather Widget'];

  return (
    <>
      <div className="app-navbar">
        {pages.map((page) => (
            <button
                key={page}
                className={`app-tab ${selectedPage === page ? 'active' : ''}`}
                onClick={() => setSelectedPage(page)}
            >
                {page}
            </button>
        ))}
      </div>
      {selectedPage === 'Live Chat + Auth' && (user ? <ChatPage /> : <LoginPage />)}
      {selectedPage === 'Device Tracking Map' && <MapPage />}
      {selectedPage === 'Weather Widget' && <WeatherWidget />}
    </>
  )
}

export default App
