// seed.js (à la racine du projet)
require('dotenv').config({ path: '.env.config' });
const dbClient = require('./utils/db-client.util');

const seed = async () => {
    const db = await dbClient.db(process.env.MONGO_DB_DATABASE);

    const collections = ['users', 'appointments', 'modules'];

    const existingCollectionsCursor = await db.listCollections();
    const existingCollections = await existingCollectionsCursor.toArray();
    const names = existingCollections.map((c) => c.name);

    collections.forEach(async (c) => {
        try {
            if (names.includes(c)) {
                await db.dropCollection(c);
            }
            await db.createCollection(c);
        } catch (e) {
            console.error(c, e);
        }
    });

    // DTO = DATA TRANSFER OBJECT
    const hash = await require('bcrypt').hash('1234', 10);

    const userDtos = [
        {
            name: {
                first: 'Saul',
                middle: 'M.',
                last: 'Goodman',
            },
            email: 'saul.goodman@gmail.com',
            address: {
                street: 'Place de la Justice',
                nbr: 1,
                postCode: 7700,
                city: 'Mouscron',
                country: 'Belgium',
            },
            password: hash,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: {
                first: 'Walter',
                middle: 'H.',
                last: 'White',
            },
            email: 'walter.white@gmail.com',
            address: {
                street: 'Place de la Justice',
                nbr: 1,
                postCode: 7700,
                city: 'Mouscron',
                country: 'Belgium',
            },
            password: hash,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: {
                first: 'Gus',
                middle: 'M.',
                last: 'Fring',
            },
            email: 'gustavo.fring@gmail.com',
            address: {
                street: 'Place de la Justice',
                nbr: 1,
                postCode: 7700,
                city: 'Mouscron',
                country: 'Belgium',
            },
            password: hash,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const createdUsers = await Promise.all(
        userDtos.map((u) => db.collection('users').insertOne(u))
    );

    const appointmentDtos = [
        {
            end: new Date('2023-02-01T11:00:00'),
            start: new Date('2023-02-01T10:00:00'),
            subject: 'Test',
            location: 'Secrétariat',
            participants: [
                createdUsers[0].insertedId,
                createdUsers[1].insertedId,
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            end: new Date('2023-02-12T10:00:00'),
            start: new Date('2023-02-12T09:00:00'),
            subject: 'Inscription',
            location: 'Local 128',
            participants: [
                createdUsers[1].insertedId,
                createdUsers[2].insertedId,
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    await db.collection('appointments').insertMany(appointmentDtos);
};

seed();
