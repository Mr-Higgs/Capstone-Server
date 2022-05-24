const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const { v4: uuid } = require('uuid');
const userRoutes = require('./routes/users');


//configuration
require("dotenv").config();
const PORT = process.env.port || 3000;


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('assets'));
app.use((_req, _res, next) => {
    console.log(`Incoming Request`);
    next();
});

app.get('/', (_req, res) => {
    res.send('Welcome to TraderThings!');
});

//UserCoursePage Route end point - component located on DashboardPage.js
app.get('/lessons', (_req, res) => {
    const lessons = readLessons();
    const strippedData = lessons.map(lesson => {
        return {
            id: lesson.id,
            chapter: lesson.chapter,
            title: lesson.title,
            content: lesson.content,
            video: lesson.video,
        };
    });
    res.json(strippedData);
})

//endpoint for specific video request
app.get("/lessons/:id", (req, res) => {
    const lessonsData = readLessons();
    const lessonURL = req.params.id;
    const lessonFound = lessonsData.find(lesson => lesson.id === lessonURL);
    res.json(lessonFound);
})

//Function to read videos
function readLessons() {
    const lessons = fs.readFileSync("./data/lessons.json");
    const lessonsData = JSON.parse(lessons);
    return lessonsData;
}

// Routes
app.use('/api/users', userRoutes);


app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
