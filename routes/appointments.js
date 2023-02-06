var express = require('express');
var router = express.Router();
const controller = require('../controllers/appointments.controller');
// const controller = require('../controllers/appointments.controller.js');

/* GET users listing. */
router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.post('/', controller.create);
router.patch('/:id', controller.updateOne);
router.delete('/:id', controller.deleteOne);

//ajouter supprimer participants
router.get('/:id/participants', controller.findParticipants);
router.post('/:id/participants', controller.addParticipant);
router.delete('/:id/:partipcantId', controller.removeParticipant);

module.exports = router;
