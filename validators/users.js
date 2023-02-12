const { string } = require('joi');

module.exports = {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            // required: ['username,password,email'],
            properties: {
                name: {
                    bsonType: 'object',
                    required: ['first', 'middle', 'last'],
                    properties: {
                        first: { bsonType: string },
                        middle: { bsonType: string },
                        last: { bsonType: string },
                    },
                },
                username: {
                    bsonType: 'string',
                    description: ' must be a string and is required',
                },
                password: {
                    bsonType: 'string',
                    description: ' must be a string and is required',
                },
                mail: {
                    bsonType: 'string',
                    description: ' must be a string and is required',
                },
            },
        },
    },
};
