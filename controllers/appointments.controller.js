const { dbClient, redisClient } = require('../utils/');
// const dbClient = require('../utils/').dbClient;
const database = dbClient.db(process.env.MONGO_DB_DATABASE);
const collection = database.collection('appointments');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { ObjectId } = require('mongodb');

const findAll = async (req, res) => {
    const data = await collection
        .aggregate([
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
        ])
        .toArray();

    return res.status(200).json(data);
};
const findOne = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            message: 'No id provided',
        });
    }
    const data = await collection.findOne({ _id: new ObjectId(id) });
    if (!data) {
        res.status(404).json({
            message: `No appointments found with id ${id}`,
        });
    }
    res.status(200).json(data);
};

const create = async (req, res) => {
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

    if (error) {
        return res.status(400).json({ message: error });
    }

    const data = await collection.insertOne(value).catch((err) => {
        return { error: 'Impossible to save this record !' };
    });

    res.status(201).json(data);
};

const updateOne = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'No id provided' });
    }
    const { body } = req;
    const schema = Joi.object({
        start: Joi.date().greater('now'),
        end: Joi.date().greater(Joi.ref('start')),
        subject: Joi.string().max(150),
        description: Joi.string().max(1500),
        location: Joi.string(),
        participants: Joi.array().items(Joi.string()).min(2).max(10),
    });

    let updateValue;

    if (!value.participants) {
        //supprimer la clé participants de l'objet à insérer
        delete value.participants;

        // updateValue = value;
        //permet de copier tous les autres valeurs autre que les participants dans updateValue également les propriétés
        updateValue = { ...value };
    } else {
        //sinon caster les strings en ObjectId
        updateValue = {
            ...value,
            participants: value.participants.map((el) => new ObjectId(el)),
        };
    }
    const { value, error } = schema.validateAsync(body);
    if (error) {
        res.status(400).json(error);
    }
    const data = await collection.findOneAndUpdate(
        {
            _id: new ObjectId(id),
        },
        {
            $addToSet: { participants: new ObjectId(body.participantId) },
        },
        {
            returnDocument: 'after',
            // upsert:
        }
    );
    res.status(200).json(data);
};
const deleteOne = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            message: 'No id provided',
        });
    }
    const { force } = req.query;
    if (force === undefined || parseInt(force, 10) === 0) {
        // suppression logique
        const data = await collection.updateOne(
            { _id: id }, // filter
            {
                $set: {
                    deletedAt: new Date(),
                },
            }
        );
        res.status(200).json(data);
    }

    if (parseInt(force, 10) === 1) {
        // suppression physique
        await collection.deleteOne({ _id: new ObjectId(id) });
        res.status(204);
    }

    res.status(400).json({
        message: 'Malformed parameter "force"',
    });
};

const findParticipants = async (req, res) => {
    const { id } = req.params;

    // const data = await collection.findOne({ _id: new ObjectId(id) });

    //gestion des erreurs
    const data = await collection
        .aggregate([
            {
                $match: {
                    _id: new ObjectId('63e1374bf557f22fd1f40ce9'),
                },
            },
            {
                $project: {
                    participants: 1,
                },
            },
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
                    participants: '$populatedParticipants',
                },
            },
        ])
        .toArray();
    if (data.length === 0) {
        res.status(404).json({
            message: 'No appointment found with these parameters',
        });
    } else {
        res.status(200).json(data);
    }
};

const addParticipant = async (req, res) => {
    const { id } = req.params;
    const { body } = req;

    // gestion des erreurs à développer
    // validation de schéma:

    if (!id) {
        res.status(400).json({ message: 'No id provided' });
    }

    const data = await collection.findOneAndUpdate(
        {
            _id: new ObjectId(id),
        },
        {
            $push: { participants: new ObjectId(body.participantId) },
        },
        {
            returnDocument: 'after',
        }
    );

    res.status(201).json({ message: 'Participant added' });
};
const removeParticipant = async (req, res) => {
    const { id, participantId } = req.params;
    //gestion des erreurs
    const data = await collection.findOneAndUpdate(
        {
            //filtre
            _id: new ObjectId(id),
        },
        {
            //comment faire
            $pull: {
                participants: { $in: [new ObjectId(participantId)] },
            },
        },
        {
            //options mongos
            returnDocument: 'after',
        }
    );
    res.status(201).json({ message: 'Participant removed' });
};

module.exports = {
    findAll,
    findOne,
    create,
    updateOne,
    deleteOne,
    findParticipants,
    addParticipant,
    removeParticipant,
};
