import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Function to create a JSON Web Token (JWT) with user ID as payload
const createToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
}
// Controller function for logging in a user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Nesuvesti duomenys' });
    };

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.status(200).json({ email, token, isAdmin: user.isAdmin });
    } catch (error) {
        res.status(400).json({ error: error.message });
    };
};


// Controller function for signing up a new user
export const signupUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Nesuvesti duomenys' });
    };

    try {
        const user = await User.signup(email, password);
        const token = createToken(user._id);
        res.status(200).json({ email, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    };
};