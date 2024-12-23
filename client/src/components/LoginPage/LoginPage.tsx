import { useContext, useState } from "react"
import './LoginPage.css'
import authService from '../../services/auth.service'
import { AuthContext } from "../../context/auth.context";
import { AxiosError } from "axios";

export default function LoginPage() {
    const { authenticateUser } = useContext(AuthContext);
    const [loginForm, setLoginForm] = useState({ // state to store the login form data
        email: '',
        password: ''
    })

    function handleChange(event: React.ChangeEvent) {
        const { name, value } = event.target as HTMLInputElement; // get the name and value of the input field
        setLoginForm(prev => { // update the state with the new value
            return {...prev, [name]: value}
        })
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        try {
            const response = await authService.login(loginForm) // send the login form to the backend and receive the authentication token
            const { authToken } = response.data  
            localStorage.setItem("authToken", authToken); // If the POST request is successful, store the authentication token in the local storage
            authenticateUser(); // after the token is stored authenticate the user
          
        } catch (error: unknown) {
            if (error instanceof AxiosError) {
                alert(error.response?.data.message); // handle incorrect login credentials
            } else {
                alert("An unexpected error occurred. Please try again later."); // handle non-Axios errors
            }
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Log in to start chatting</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={loginForm.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={loginForm.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
            </div>
        </div>
    )
}