require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');

const helmet = require("helmet");
const bodyParser = require('body-parser');

const cors = require("cors")

const stuffRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');

// ajout de helmet pour sécurisé les en-tête
const app = express()

mongoose.connect(process.env.MONGODB_LINK, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(cors())

// reponse en JSON
app.use(helmet());
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', stuffRoutes);

// exportation de l'app
module.exports = app