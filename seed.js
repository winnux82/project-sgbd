// seed.js (à la racine du projet)
require('dotenv').config({ path: '.env.config' });
const { faker } = require('@faker-js/faker');
const dbClient = require('./utils/db-client.util');
const bcrypt = require('bcrypt');
const validators = require('./validators');

(async () => {
    const db = dbClient.db(process.env.MONGO_DB_DATABASE);

    // db.dropCollection('users');
    const collections = ['users', 'appointments', 'modules'];
    const existingCollectionsCursor = await db.listCollections();
    const existingcollections = await existingCollectionsCursor.toArray();
    const names = existingcollections.map((c) => c.name);
    console.log(names);

    //on efface les données et on les recrée
    collections.forEach(async (c) => {
        try {
            if (names.includes(c)) {
                await db.dropCollection(c);
            } else await db.createCollection(c, validators[c] ?? null);
        } catch (e) {
            console.error(c, e);
        }
    });

    //DTO = DATA TRANSFER OBJECT

    const userDtos = await Promise.all(
        [...Array(5)].map(async () => {
            return {
                name: {
                    first: faker.name.firstName(),
                    middle: faker.name.middleName(),
                    last: faker.name.lastName(),
                },
                email: faker.internet.email(),
                address: {
                    street: faker.address.streetAddress(),
                    nbr: faker.address.buildingNumber(),
                    postCode: faker.address.zipCode(),
                    city: faker.address.city(),
                    country: faker.address.country(),
                },
                password: bcrypt.hashSync(faker.internet.password(), 10),
                createdAt: new Date(),
                updatedAt: new Date(),
            };
        })
    );
    console.log(userDtos);
    const createdUsers = await Promise.all(
        userDtos.map((u) => db.collection('users').insertOne(u))
    );
    const location = ['Secréatariat', 'Local 128', 'Local 125', 'Local 555'];
    const appointmentDtos = [...Array(5)].map(() => ({
        end: new Date('2023-02-01T10:00:00Z'),
        start: new Date(),
        subject: 'test',
        location: location[Math.floor(Math.random() * 3)],
        participants: [
            createdUsers[Math.floor(Math.random() * 4)].insertedId,
            createdUsers[Math.floor(Math.random() * 4)].insertedId,
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    }));

    const createdAppointments = await Promise.all(
        appointmentDtos.map((u) => db.collection('appointments').insertOne(u))
    );
    process.exit(0);
})();
// seed();
