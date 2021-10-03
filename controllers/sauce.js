const Sauce = require('../models/Sauce')
const fs = require('fs');

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
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ messsage: error.message }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ message: error.message }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ message: error.message  }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};
  
  exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(400).json({message: error.message }));
  }

  exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({message: error.message  }));
  }

  exports.likeDislikeSauce = (req, res, next) => {
    const like = req.body.like;
    const userId = req.body.userId;
    const sauceId = req.params.id;
  
    switch (like) {  
      case 1: Sauce.updateOne({ _id: sauceId }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
        .then(() => res.status(200).json({ message: 'Sauce likée !' }))
        .catch(error => res.status(400).json({ error }));
        break;
      case 0: Sauce.findOne({ _id: sauceId })
        .then(sauce => {
          const likesOrDislikes = {};
          const usersLikedOrDisliked = {};
          if (Sauce.usersLiked.includes(userId)) {
            likesOrDislikes.likes = -1;
            usersLikedOrDisliked.usersLiked = userId;
          } else if (Sauce.usersDisliked.includes(userId)) {
            likesOrDislikes.dislikes = -1;
            usersLikedOrDisliked.usersDisliked = userId;
          }
          Sauce.updateOne({ _id: sauceId }, { $inc: likesOrDislikes, $pull: usersLikedOrDisliked })
            .then(() => res.status(200).json({ message: 'Modifé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
        
        break;
      case -1: Sauce.updateOne({ _id: sauceId }, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
        .then(() => res.status(200).json({ message: 'Sauce dislikée !' }))
        .catch(error => res.status(400).json({ error }));
        break;
    }

  };