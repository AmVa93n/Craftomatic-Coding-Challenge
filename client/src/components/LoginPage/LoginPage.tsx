import { useContext, useState } from "react"
import './LoginPage.css'
import authService from '../../services/auth.service'
import { AuthContext } from "../../context/auth.context";
import { AxiosError } from "axios";

export default function LoginPage() {
    const { authenticateUser, user, logOutUser } = useContext(AuthContext); // get the authenticateUser function from the AuthContext
    const [loginForm, setLoginForm] = useState({ // state to store the login form data
        email: '',
        password: ''
    })

    function handleChange(event: React.ChangeEvent) {
        const field = (event.target as HTMLInputElement).name // get the name of the input field
        const value = (event.target as HTMLInputElement).value // get the value of the input field
        setLoginForm(prev => { // update the state with the new value
            return {...prev, [field]: value}
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
        <div>
            <h1>Login</h1>
            {!user && <form>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" name="email" value={loginForm.email} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input type="password" name="password" value={loginForm.password} onChange={handleChange}/>
                </div>
                
                <button type="submit" onClick={handleSubmit}>Login</button>
            </form>}

            {user && <button onClick={logOutUser}>Logout</button>}

            <div className="login-feedback" style={{backgroundColor: user ? 'lightgreen' : 'pink'}}>
                {user ?
                    <p>You are currently logged in as {user.username} with the email address {user.email}</p>
                    :
                    <p>You are currently not logged in</p>
                }
            </div>
        </div>
    )
}