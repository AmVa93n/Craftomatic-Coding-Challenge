# Craftomatic-Coding-Challenge
### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/AmVa93n/Craftomatic-Coding-Challenge.git
   ```

2. Navigate to `client` and `server` directories and install the required Node.js packages for each:
   ```sh
   cd client
   npm install
   ```
   ```sh
   cd server
   npm install
   ```

3. Use secure online tools like [Password Generator](https://passwordsgenerator.net/) or other random string generators to create a secret key for JWT.

4. Create an `.env` file and add your secret key
   ```js
   TOKEN_SECRET=your_generated_secret;
   ```

5. Start both the client and server applications:
    ```sh
    cd client
    npm run dev
    ```
    ```sh
    cd server
    npm run start
    ```

### Usage

#### User Authentication
The `database.json`file in the server directory contains a list of mock user objects. Pick a user and log in with their email and password.

#### Live Chat
Open another browser tab in incognito. Pick another user from the list in `database.json` and log in with their email and password on the incognito tab. Now you can simulate a live chat between the two users.

#### Weather Widget
The widget will fetch the data based on your location, so you must enable location access in your browser for it to work.