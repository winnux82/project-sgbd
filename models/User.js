const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        _id,

        name: {
            first,
            middle,
            last,
        },
        address: {
            street,
            nbr,
            postCode,
            city,
            country,
        },
        dateOfBirth,
        email,
        phone,
        gender,
        relationshipStatus,
        password,
        socialSecurityNumber,
        createdAt,
        updatedAt,
        deletedAt,
    },
    { timestamps: true }
);

module.exports = client.model('Users', userSchema);
