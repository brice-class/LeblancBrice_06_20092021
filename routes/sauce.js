const express = require('express');

const router = express.Router();

const stuffCtrl = require('../controllers/sauce')

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');


router.post('/',auth, multer, stuffCtrl.createThing);
  
router.put('/:id',auth, multer, stuffCtrl.modifyThing);
  
router.delete('/:id',auth, stuffCtrl.deleteThing);
  
router.get('/:id',auth, stuffCtrl.getOneThing );
  
router.get('/',auth, stuffCtrl.getAllThings);
  
router.post("/:id/like", auth, stuffCtrl.likeDislikeSauce);


module.exports = router;