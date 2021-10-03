const Thing = require('../models/Sauce')
const fs = require('fs');

exports.createThing = (req, res, next) => {
  const thingObject = JSON.parse(req.body.sauce);
  console.log(thingObject)
  delete thingObject._id;
  const thing = new Thing({
    ...thingObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  console.log(thing)
  thing.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ messsage: error.message }));
};

exports.modifyThing = (req, res, next) => {
  const thingObject = req.file ?
    {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Thing.updateOne({ _id: req.params.id }, { ...thingObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteThing = (req, res, next) => {
  Thing.findOne({ _id: req.params.id })
    .then(thing => {
      const filename = thing.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Thing.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};
  
  exports.getOneThing = (req, res, next) => {
    Thing.findOne({ _id: req.params.id })
      .then(thing => res.status(200).json(thing))
      .catch(error => res.status(404).json({ error }));
  }

  exports.getAllThings = (req, res, next) => {
    Thing.find()
      .then(things => res.status(200).json(things))
      .catch(error => res.status(400).json({ error }));
  }

  exports.likeDislikeSauce = (req, res, next) => {
    const like = req.body.like;
    const userId = req.body.userId;
    const sauceId = req.params.id;
  
    switch (like) {  
      case 1: Thing.updateOne({ _id: sauceId }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
        .then(() => res.status(200).json({ message: 'Sauce likée !' }))
        .catch(error => res.status(400).json({ error }));
        break;
      case 0: Thing.findOne({ _id: sauceId })
        .then(sauce => {
          const likesOrDislikes = {};
          const usersLikedOrDisliked = {};
          if (Thing.usersLiked.includes(userId)) {
            likesOrDislikes.likes = -1;
            usersLikedOrDisliked.usersLiked = userId;
          } else if (Thing.usersDisliked.includes(userId)) {
            likesOrDislikes.dislikes = -1;
            usersLikedOrDisliked.usersDisliked = userId;
          }
          Thing.updateOne({ _id: sauceId }, { $inc: likesOrDislikes, $pull: usersLikedOrDisliked })
            .then(() => res.status(200).json({ message: 'Modifé !' }))
            .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
        
        break;
      case -1: Thing.updateOne({ _id: sauceId }, { $inc: { dislikes: 1 }, $push: { usersDisliked: userId } })
        .then(() => res.status(200).json({ message: 'Sauce dislikée !' }))
        .catch(error => res.status(400).json({ error }));
        break;
    }

  };