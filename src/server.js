// Import necessary modules
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const mysql = require('mysql2');
const winston = require('winston'); // Import the Winston logging library

// Initialize Express app
const app = express();

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info', // Set the default logging level
  format: winston.format.json(), // Specify the log format
  transports: [
    // Define a transport for logging to a file
    new winston.transports.File({ filename: 'logfile.log' }),
  ],
});

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 } // Example: 1 hour session expiration
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'views'))); // Serve static files from 'views' directory

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'myapp_user',
    password: 'maansi@1234',
    database: 'myapp'
})

db.connect((err) => {
    if (err) {
        logger.error('Error connecting to MySQL database:', err); // Log error connecting to MySQL database
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    logger.info('Connected to MySQL database'); // Log successful connection to MySQL database
    console.log('Connected to MySQL database');
});

// Routes

// Login page route
app.get('/', (req, res) => {
    logger.info('GET request received for /'); // Log incoming GET request for '/'
    res.sendFile(path.join(__dirname, 'views', 'login.html'))
});

// Login POST request handler
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true
}));

// Dashboard route - you can customize this according to your needs
app.get('/dashboard', (req, res) => {
    // If user is authenticated, render the dashboard with a welcome message
    if (req.isAuthenticated()) {
        const username = req.user.username; // Get the username of the authenticated user
        logger.info(`GET request received for /dashboard by user ${username}`); // Log incoming GET request for '/dashboard'
        res.render('dashboard', { username }); // Render the dashboard with the username
    } else {
        logger.warn('Unauthorized access to /dashboard'); // Log unauthorized access attempt to '/dashboard'
        res.redirect('/'); // Redirect to the login page if user is not authenticated
    }
});

// Signup page route
app.get('/signup', (req, res) => {
    logger.info('GET request received for /signup'); // Log incoming GET request for '/signup'
    res.sendFile(path.join(__dirname, 'views', 'create-new-user.html'));
});

// Handle signup form submission
app.post('/signup', (req, res) => {
    const { username, password } = req.body;
    
    // Insert user into database
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err, result) => {
        if (err) {
            logger.error('Error creating user:', err); // Log error creating user
            console.error('Error creating user:', err);
            res.status(500).send('Failed to create user.');
            return;
        }
        logger.info(`User ${username} successfully created`); // Log successful user creation
        res.redirect('/'); // Redirect to the login page after successful signup
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack); // Log error stack trace
    console.error(err.stack);
    res.status(500).send('Welcome to KitchenCrafts');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`); // Log server startup
    console.log(`Server running on port ${PORT}`);
});
