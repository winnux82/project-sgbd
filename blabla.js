const faker = require('@faker-js/faker');

const userDTO = {
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
console.log(userDTO);
