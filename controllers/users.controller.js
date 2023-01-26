const dbClient = require('../utils/').dbClient;
const database = dbClient.db(process.env.MONGO_DB_DATABASE);
const collection = database.collection('users');
const bcrypt = require('bcrypt');
const Joi = require('joi');

exports.findAll = async (req, res) => {
    const data = await collection.find({}).toArray();
    res.status(200).json(data);
};

exports.findOne = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({
            message: 'No id provided',
        });
    }
    const data = await collection.findOne({ _id: id });
    if (!data) {
        res.status(404).json({
            message: `No user found with id ${id}`,
        });
    }
    res.status(200).json(data);
};
exports.create = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
    });

    const { body } = req;

    const { value, error } = schema.validate(body);

    if (error) {
        return res.status(400).json({ message: error });
    }

    const { password, ...rest } = value;

    const hash = await bcrypt.hash(password, 10);

    const data = await collection.insertOne({
        password: hash,
        ...rest,
    });

    res.status(201).json(data);
};
exports.updateOne = async (req, res) => {};
exports.deleteOne = async (req, res) => {
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
        await collection.deleteOne({ _id: id });
        res.status(204);
    }

    res.status(400).json({
        message: 'Malformed parameter "force"',
    });
};
