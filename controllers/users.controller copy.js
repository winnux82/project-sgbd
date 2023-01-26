const dbClient = require('../utils/').dbClient;
const database = dbClient.db(process.env.MONGO_DB_DATABASE);
const collection = database.collection('users');
const bcrypt = require('bcrypt');
const { JSONCookie } = require('cookie-parser');
const Joi = require('joi');

//const User = require('../models/User');

const findAll = async (req, res) => {
    console.log('Liste contrôleur users');

    const users = await collection.find({}).toArray();

    res.status(200).json(users);
};

const findOne = async (req, res) => {
    // const idUser = req.params.id;
    // const { data } = axios.get();
    //par déstructuration
    const { id, page, test } = req.params;

    if (!id) {
        res.status(400).json({ message: 'No id provided' });
    }
    const data = await collection.findOne({ _id: id });
    if (!data) {
        res.status(404).json({ message: `No user found with id ${id}` });
    }

    res.status(200).json(data);
};

const create = async (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        address: Joi.object({
            city: Joi.string(),
            postCode: Joi.number(),
        }),
    });
    const { body } = req;

    const { value, error } = schema.validate(body);
    if (error) {
        return res.status(400).json({ message: error });
    }

    //stocke le reste du body dans une variable ...rest
    const { password, ...rest } = body;

    const hash = await bcrypt.hash(password, 10);

    const data = await collection.insertOne({
        password: hash,
        ...rest, // ...spread
    });

    const test = {
        ...body,
        password: hash,
    };
    res.status(201).json(data);

    //     name: 'Rahul', orderCount: 5
    // }.then((result) => {
    //         console.log(result);
    //     }));
    // Customer.create({ name: 'Rahul', orderCount: 5 }).then((result) => {
    //     console.log(result);
};

const updateOne = async (req, res) => {};
const deleteOne = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        res.status(400).json({ message: 'No id provided' });
    }
    const { force } = req.query;

    if (force === undefined || parseInt(force, 10) === 0) {
        //suppression logique
        await collection.updateOne(
            {
                _id: id, //filter
            },
            {
                $set: { deleteAt: new Date() },
            }
        );
        res.status(200).json(data);
    }
    if (parseInt(force, 10) === 1) {
        //suppression physique
        const result = await collection.deleteOne({ _id: id });
        // if (result.deletedCount === 1) {
        //     console.log('Successfully deleted');
        // }
        res.status(204);
    }
    res.status(400).json({ message: 'Malformed parameter "force"' });
};
function retrieveId(req, res) {
    const { id, page, test } = req.params;
    if (!id) {
        res.status(400).json({ message: 'No id provided' });
    }
    return id;
}
module.exports = {
    retrieveId,
    findAll,
    findOne,
    create,
    updateOne,
    deleteOne,
};
