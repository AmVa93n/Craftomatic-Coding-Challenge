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

3. Use secure online tools like [https://passwordsgenerator.net/](Password Generator) or other random string generators to create a secret key for JWT.

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
