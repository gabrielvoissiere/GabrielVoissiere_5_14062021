const User = require('../models/User'); // On importe le modèle
const bcrypt = require('bcrypt'); // Package de cryptage
const jwt = require('jsonwebtoken'); //Package de création et de vérification des token

//Package de validation du mdp
const passwordValidator = require('password-validator');
let schemaPasswordValidator = new passwordValidator();
schemaPasswordValidator // Entre 8 et 50 caractères, doit contenir des lettres maj et min, un chiffre et pas d'espace.
  .is().min(8)
  .is().max(50)
  .has().uppercase()
  .has().lowercase()
  .has().digits(1)
  .has().not().spaces()
  .is().not().oneOf(['Passw0rd', 'Password123']); // Liste noire des valeurs

exports.signup = (req, res, next) => { // Fonction pour l'enregistrement de l'user 
  if (schemaPasswordValidator.validate(req.body.password) == true) {
    bcrypt.hash(req.body.password, 10) // Fonction asynchrone de hashage bcrypt, on "sale" le mdp 10 fois pour exécuter l'algorithme
      .then(hash => {
        const user = new User({ // Création d’un nouveau user avec mdp cryptée et email
          email: req.body.email,
          password: hash
        });
        user.save() //méthode pour enregistrer dans la bdd
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    return (error => res.status(400).json({ error }));
  }
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};