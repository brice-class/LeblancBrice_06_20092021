const Sauce = require('../models/Sauce')
const fs = require('fs');
const jwt = require('jsonwebtoken');


exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  sauceObject.likes = 0;
  sauceObject.dislikes = 0;
  console.log(sauceObject)
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  console.log(sauce)
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
    .catch(error => res.status(400).json({ messsage: error.message }));
};

exports.modifySauce = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.SIGNATURE);
  const userId = decodedToken.userId;

  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {

       if (sauce.userId ==  userId) {

  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
    .catch(error => res.status(400).json({ message: error.message }));
  } else {
    return res.status(403).json({message: "not authorised"});
}
})
.catch(error => res.status(500).json({ message: error.message }));
};

exports.deleteSauce = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.SIGNATURE);
  const userId = decodedToken.userId;

  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {

       if (sauce.userId ==  userId) {
        
      
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
          .catch(error => res.status(400).json({ message: error.message  }));
      });
    } else {
        return res.status(403).json({message: "not authorised"});
    }
    })
    .catch(error => res.status(500).json({ message : error.message }));
};
  
  exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(400).json({message: error.message }));
  }

  exports.getAllSauces = (req, res, next) => {
    console.log(req.user.userId)
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({message: error.message  }));
  }

  
  exports.likeDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        switch (req.body.like) {
          case -1: //au clic sur dislike           
            // si le userId n'est pas dans le tableau userDisliked, on le push
            if (sauce.usersDisliked.indexOf(req.body.userId) === -1) {
              sauce.usersDisliked.push(req.body.userId);
            }
            break;
  
          case 1: //clic sur like
            //si le userId n'est pas dans le tableau userLiked, on le push
            if (sauce.usersLiked.indexOf(req.body.userId) === -1) {
              sauce.usersLiked.push(req.body.userId);
            }
            break;
          case 0: //annule like ou dislike
            // si le userId est présent dans la tableau usersDisliked,  on le splice
            if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
              sauce.usersDisliked.splice(
                sauce.usersDisliked.indexOf(req.body.userId, 1)
              );
            }
            // si le userId est présent dans la tableau usersLiked, on le splice
            if (sauce.usersLiked.indexOf(req.body.userId) !== -1) {
              sauce.usersLiked.splice(
                sauce.usersLiked.indexOf(req.body.userId, 1)
              );
            }
            break;
          default:
            return res.status(400).json({ error: "Valeur de like invalide !" });
        }
        //Affichage  du nombre de like et de dislike
        sauce.likes = sauce.usersLiked.length;
        sauce.dislikes = sauce.usersDisliked.length;
        sauce
          .save()
          .then(() =>
            res.status(200).json({ message: "Compteurs de likes mis à jour !" })
          )
          .catch((error) => res.status(400).json({ error }));
      })
      .catch((error) => res.status(400).json({ error }));
  };
