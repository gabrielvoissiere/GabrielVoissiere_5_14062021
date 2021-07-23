const User = require('../models/User'); // importation du modèle
const bcrypt = require('bcrypt'); // Package de cryptage pour le mot de passe
const jwt = require('jsonwebtoken'); //Package de création et de vérification des token

// validation du mdp
const passwordValidator = require('password-validator');
let schemaPasswordValidator = new passwordValidator();
schemaPasswordValidator // 8 caractères minimum et 50 caractères maximum, avec des letre en majuscule, minuscule, et un chiffre
  .is().min(8)
  .is().max(50)
  .has().uppercase()
  .has().lowercase()
  .has().digits(1)
  .has().not().spaces()
  .is().not().oneOf(['Passw0rd', 'Password123']); // valeur interdite

exports.signup = (req, res, next) => { // enregistrement de l'utilisateur
  if (schemaPasswordValidator.validate(req.body.password) == true) {
    bcrypt.hash(req.body.password, 10) // hashage du mot de passe, le mots de passe er salé 10 fois
      .then(hash => {
        const user = new User({ // Création d’un nouvel utilisateur avec mot de passe cryptée et email masquer
          email: maskEmail(req.body.email),
          password: hash
        });
        user.save() //enregistrement de l'utilisateur dans la base de donné
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  } else {
    return (error => res.status(400).json({ error }));
  }
};

exports.login = (req, res, next) => { // connexion de l’utilisateur
  User.findOne({ email: maskEmail(req.body.email) })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password) // compare le mdp envoyé par l'utilisateur avec le mot de passe de la bdd
        .then(valid => { // test si comparaison est valable ou non
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
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