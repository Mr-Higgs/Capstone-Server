const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');


// ## POST /api/users/register
// -   Creates a new user.
// -   Expected body: { first_name, last_name, phone, address, email, password }
router.post('/register', (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).send("Please enter the required fields.");
    }

    const hashedPassword = bcrypt.hashSync(password, 12);

    // Create the new user
    const newUser = {
        first_name: first_name,
        last_name: last_name,
        email: email,
        password: hashedPassword
    };

    knex('users')
        .insert(newUser)
        .then(() => {
            res.status(201).send("Registered successfully");
        })
        .catch((err) => {
            console.log(err)
            res.status(400).send("Failed registration");
        });
});


// ## POST /api/users/login
// -   Generates and responds a JWT for the user to use for future authorization.
// -   Expected body: { email, password }
// -   Response format: { token: "JWT_TOKEN_HERE" }
router.post('/login', (req, res) => {
    const { email: userEmail, password } = req.body;
    console.log(userEmail, password);
    
    if (!userEmail || !password) {
        return res.status(400).send("Please enter the required fields");
    }

    // Find the user
    knex('users')
        .where({ email: userEmail })
        .first()
        .then((user) => {
            // console.log(user)
            // const hashedPassword = bcrypt.hashSync(password, 12);
            // console.log(hashedPassword, user.password);
            const isPasswordCorrect = bcrypt.compareSync(password, user.password);

            if (!isPasswordCorrect) {
                return res.status(400).send("Invalid password");
            }

            // Create a token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_KEY,
                { expiresIn: "24h" }
            );

            res.json({ token });
        })
        .catch(() => {
            res.status(400).send("Invalid credentials");
        });
});


// ## GET /api/users/current
// -   Gets information about the currently logged in user.
// -   If no valid JWT is provided, this route will respond with 401 Unauthorized.
// -   Expected headers: { Authorization: "Bearer JWT_TOKEN_HERE" }
router.get('/current', (req, res) => {
    // If there is no auth header provided
    if (!req.headers.authorization) {
        return res.status(401).send("Please login");
    }

    // Parse the Bearer token
    const authToken = req.headers.authorization.split(" ")[1];
    
    // Verify the token
    jwt.verify(authToken, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send("Invalid auth token");
        }

        knex('users')
            .where({ email: decoded.email })
            .first()
            .then((user) => {
                // Respond with the user data
                delete user.password;
                res.json(user);
            });
    });
});

// ## GET /api/users/current
// -   Gets information about the currently logged in user.
// -   Expects valid JWT authentication to run through the "authenticate" middleware
router.get('/current', authenticate, (req, res) => {
    knex('users')
        .where({ email: req.user.email })
        .first()
        .then((user) => {
            // Respond with the user data
            delete user.password;
            res.json(user);
        });
});



module.exports = router;
