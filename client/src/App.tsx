import LoginPage from './components/LoginPage/LoginPage'
import './App.css'
import ChatPage from './components/ChatPage/ChatPage'
import useAuth from './hooks/useAuth';

function App() {
  const { user } = useAuth();

  return (
    <>
      {user ? <ChatPage /> : <LoginPage />}
    </>
  )
}

export default App
