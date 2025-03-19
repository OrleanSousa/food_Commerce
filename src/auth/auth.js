import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import crypto from 'crypto';
import { Mongo } from '../database/mongo.js';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const collectionName = 'users';

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, callback) => {
    const user = await Mongo.db.collection(collectionName).findOne({ email: email });

    if (!user) {
        return callback(null, false);
    }

    const saltBuffer = user.salt.buffer;
    const hashedPassword = crypto.pbkdf2Sync(password, saltBuffer, 310000, 16, 'sha256');
    const userPasswordBuffer = Buffer.from(user.password.buffer);

    if (!crypto.timingSafeEqual(userPasswordBuffer, hashedPassword)) {
        return callback(null, false);
    }

    const { password: _, salt: __, ...rest } = user;
    return callback(null, rest);
}));

const authRouter = express.Router();

authRouter.post('/signup', async (req, res) => {
    try {
        const checkUser = await Mongo.db.collection(collectionName).findOne({ email: req.body.email });

        if (checkUser) {
            return res.status(500).send({
                success: false,
                statusCode: 500,
                body: { text: 'User already exists!' }
            });
        }

        const salt = crypto.randomBytes(16);
        const hashedPassword = crypto.pbkdf2Sync(req.body.password, salt, 310000, 16, 'sha256');

        const result = await Mongo.db.collection(collectionName).insertOne({
            email: req.body.email,
            password: hashedPassword,
            salt
        });

        if (result.insertedId) {
            const user = await Mongo.db.collection(collectionName).findOne({ _id: new ObjectId(result.insertedId) });
            const token = jwt.sign({ id: user._id, email: user.email }, 'secret');

            return res.send({
                success: true,
                statusCode: 200,
                body: {
                    text: 'User created!',
                    token,
                    user,
                    logged: true
                }
            });
        }
    } catch (err) {
        return res.status(500).send({
            success: false,
            statusCode: 500,
            body: { text: 'Internal server error!', error: err.message }
        });
    }
});

authRouter.post('/login', (req, res) =>{
    passport.authenticate('local', (err, user) => {
        if (err) {
            return res.status(500).send({
                success: false,
                statusCode: 500,
                body: { text: 'Internal server error!', error}
            });
        }

        if (!user) {
            return res.status(400).send({
                success: false,
                statusCode: 400,
                body: { text: 'Credentials are not correct' }
            });
        }

        const token = jwt.sign(user, 'secret');

        return res.send({
            success: true,
            statusCode: 200,
            body: {
                text: 'Logged in!',
                token,
                user,
                logged: true
            }
        });
    })(req, res);
}) 

export default authRouter;