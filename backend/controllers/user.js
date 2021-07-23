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
          email: maskEmail(req.body.email),
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

exports.login = (req, res, next) => { // fonction de connexion de l’utilisateur
  User.findOne({ email: maskEmail(req.body.email) }) // Trouver un seul user de la bdd avec email unique et masqué
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password) // compare le mdp envoyé par l’utilisateur en train de se connecter avec le hash enregistré avec le user dans la bdd
        .then(valid => { // Boolean si comparaison est valable ou non
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });//si renvoie false
          }
          res.status(200).json({ //si renvoie true, objet json avec identifiant et token
            userId: user._id,
            token: jwt.sign( //fonction de jsonwebtoken avec comme arguments :
              { userId: user._id }, // les données que l’on veut encoder dont l'userId
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' } // configuration du délai d’expiration du token
            ),
            email: maskEmail(req.body.email)
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

function maskEmail(email) {
  const splited = email.split('@');
  const leftMail = replaceWithStars(splited[0]);
  const rightMail = replaceWithStars(splited[1]);
  return `${leftMail}@${rightMail}`;
}

function replaceWithStars(str) {
  let newStr = '';
  for (let i = 0; i < str.length; i++) {
    if (i < str.length / 2) {
      newStr += '*'
    } else {
      newStr += str[i]
    }
  }
  return newStr;
}