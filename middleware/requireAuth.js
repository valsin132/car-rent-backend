import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Middleware function to require authentication
const requireAuth = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ error: "Autorizavimo token'as yra privalomas" });
    };

    const token = authorization.split(' ')[1];

    try {
        const { _id } = jwt.verify(token, process.env.SECRET);
        req.user = await User.findOne({ _id }).select('_id');
        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({ error: 'Užklausa nepatvirtinta.' });
    };
};

export default requireAuth;