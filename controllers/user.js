const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const cryptojs = require('crypto-js');

const schemaAuth = require('../schema/schemaAuth')

exports.signup = async(req, res, next) => {
  try{
 const validSchema = await  schemaAuth.validateAsync(req.body)
 if (!validSchema){

  return res.status(400).json({ error: 'erreur de donnée' });
 }
const hashEmail = cryptojs.HmacSHA512(req.body.email, process.env.CRYPTO).toString(cryptojs.enc.Base64);
User.findOne({ email: hashEmail })
    .then(user => {
      if (user) {
        return res.status(401).json({ error: 'email deja utilisé!' });
      }   
    return bcrypt.hash(req.body.password, 10)
    })
    .then(hash => {
      const user = new User({
        email: hashEmail,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json( error ));
    })
    .catch(error => res.status(500).json( error ));
  }catch(error){
    return res.status(500).json( error )
  }
};

exports.login = async(req, res, next) => {

  try{
    const validSchema = await  schemaAuth.validateAsync(req.body)
    if (!validSchema){
   
     return res.status(400).json({ error: 'erreur de donnée' });
    }
const hashEmail = cryptojs.HmacSHA512(req.body.email, process.env.CRYPTO).toString(cryptojs.enc.Base64);

    User.findOne({ email: hashEmail })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password)
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe ou email incorrect  !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
                { userId: user._id },
                process.env.SIGNATURE,
                { expiresIn: '24h' }
              )
          });
        })
        .catch(error => res.status(500).json( error ));
    })
    .catch(error => res.status(500).json( error ));
  }catch(error){
    return res.status(500).json( error )
  }
};