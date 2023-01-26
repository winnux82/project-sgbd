// seed.js (à la racine du projet)
require('dotenv').config({ path: '.env.config' });
const { faker } = require('@faker-js/faker');
const dbClient = require('./utils/db-client.util');
const bcrypt = require('bcrypt');

const seed = async () => {
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
            }
            await db.createCollection(c);
        } catch (e) {
            console.error(c);
        }
    });
    const hash = await bcrypt.hash(faker.internet.password(), 10);
    // const hash = await require('bcrypt').hash('1234', 10);

    // ---------------------------------------------------------- Méthode Sam
    //DTO = DATA TRANSFER OBJECT

    // const users = await [...Array(5)].map(() => ({
    //     name: {
    //         first: faker.name.firstName(),
    //         middle: faker.name.middleName(),
    //         last: faker.name.lastName(),
    //     },
    //     email: faker.internet.email(),
    //     address: {
    //         street: faker.address.streetAddress(),
    //         nbr: faker.address.buildingNumber(),
    //         postCode: faker.address.zipCode(),
    //         city: faker.address.city(),
    //         country: faker.address.country(),
    //     },
    //     password: hash,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    // }));

    // console.log(users);
    // -------------------------------------------------------------------------------For()
    const userDtos = [];
    for (let i = 0; i < 5; i++) {
        const userDto = {
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
            password: hash,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        console.log(userDto);
        userDtos.push(userDto);

        userDtos.map((u) => db.collection('users').insertOne(u));
    }
    //const createdUser = await db.collection('users').insertOne(userDto);

    const appointmentDto = {
        end: new Date('2023-02-01T10:00:00Z'),
        start: new Date(),
        subject: 'test',
        location: 'Secrétariat',
        participants: [createdUsers[0].insertedId, createdUsers[1].insertedId],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    console.log(appointmentDto);
    await db.collection('appointments').insertOne(appointmentDto);
};
seed();
