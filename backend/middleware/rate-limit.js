const rateLimit = require("express-rate-limit"); // Sert à limiter les requêtes

const limiter = rateLimit({ // limitation des requêtes envoyées par l'utilisateur
    windowMs:60 * 60 * 1000, // 1 heure
    max: 10, // limite à 100 requêtes
    message: "Too many request "
});

module.exports =limiter;