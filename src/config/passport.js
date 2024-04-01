// src/config/passport.js
const LocalStrategy = require('passport-local').Strategy;

// Mock user database
const users = [];

module.exports = function(passport) {
    passport.use(
        new LocalStrategy((username, password, done) => {
            // You can replace this with actual authentication logic
            const user = users.find(user => user.username === username && user.password === password);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect username or password' });
            }
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        // You would typically fetch user details from a database here
        const user = users.find(user => user.id === id);
        done(null, user);
    });
};