const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const passeportJWT = require('passport-jwt');
const JWTStrategy = passeportJWT.Strategy;
const ExtractJWT = passeportJWT.ExtractJwt;

const dbClient = require('./utils/').dbClient;
const database = dbClient.db(process.env.MONGO_DB_DATABASE);
const collection = database.collection('users');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
        },
        function (email, password, cb) {
            //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
            return collection
                .findOne({ email, password })
                .then((user) => {
                    if (!user) {
                        return cb(null, false, {
                            message: 'Incorrect email or password.',
                        });
                    }
                    return cb(null, user, {
                        message: 'Logged In Successfully',
                    });
                })
                .catch((err) => cb(err));
        }
    )
);
passport.use(
    new JWTStrategy(
        {
            jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'your_jwt_secret',
        },
        function (jwtPayload, cb) {
            //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
            return collection
                .findOneById(jwtPayload.id)
                .then((user) => {
                    return cb(null, user);
                })
                .catch((err) => {
                    return cb(err);
                });
        }
    )
);
// function myPassportLocal(db) {
//     const collection = database.collection('users');

//     passport.use(
//         new LocalStrategy(
//             {
//                 usernameField: 'username',
//                 passwordField: 'password',
//             },
//             async function (username, password, cb) {
//                 try {
//                     const user = await collection.findOne({ username });
//                     if (user && bcrypt.compareSync(password, user.password)) {
//                         return cb(null, user, {
//                             message: 'Logged In Successfully',
//                         });
//                     }
//                 } catch (e) {
//                     console.error(e);
//                 }
//                 return cb(null, false, {
//                     message: 'Incorrect email or password.',
//                 });
//             }
//             // function (email, password, cb) {
//             //     //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
//             //     return UserModel.findOne({ email, password })
//             //         .then((user) => {
//             //             if (!user) {
//             //                 return cb(null, false, {
//             //                     message: 'Incorrect email or password.',
//             //                 });
//             //             }
//             //             return cb(null, user, {
//             //                 message: 'Logged In Successfully',
//             //             });
//             //         })
//             //         .catch((err) => cb(err));
//             // }
//         )
//     );
// }

// module.exports = {
//     myPassportLocal,
// };
