const Joi = require('joi');

const dbClient = require('../utils').dbClient;
const database = dbClient.db(process.env.MONGO_DB_DATABASE);
const collection = database.collection('appointments');

const findAll = async (req, res) => {
    const data = await collection.aggregate([
        {
            $lookup: {
                from: 'users',
                localField: 'participants',
                foreignField: '_id',
                as: 'populatedParticipants',
            },
        },
        {
            $project: {
                location: 1,
                subject: 1,
                start: 1,
                end: 1,
                participants: '$populatedParticipants',
            },
        },
    ]);
    res.status(200).json(data);
};

const getAppointement = async (req, res) => {};
const createAppointement = async (req, res) => {
    const schema = Joi.object({
        //end : date+h + futur + requis + postérieure à start
        //start: date+h + futur + requis
        //subject : string + max  150 + requis
        //description : string + max 1500 non requis
        //location : string + requis
        //participants : array > string + min 2 éléments + max 10
        start: Joi.date().greater('now').required(),
        end: Joi.date().greater(Joi.ref('start')).required(),
        subject: Joi.string().max(150).required(),
        description: Joi.string().max(150),
        location: Joi.string(),
        participants: Joi.array().items(Joi.string()).min(2).max(10),
    });

    const { body } = req;

    const { value, error } = schema.validate(body);
    if (error) {
        return res.status(400).json({ message: error });
    }
    const { ...rest } = value;

    const data = await collection.insertOne({
        ...rest,
    });

    res.status(201).json(data);
};
const updateAppointement = async (req, res) => {};
const deleteAppointement = async (req, res) => {};

module.exports = {
    findAll,
    getAppointement,
    createAppointement,
    updateAppointement,
    deleteAppointement,
};
