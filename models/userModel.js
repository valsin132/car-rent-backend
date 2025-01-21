import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const Schema = mongoose.Schema;
// Defining the user schema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean
    }
});
// Adding static methods to the user schema for signup and login functionalities
userSchema.statics.signup = async function (email, password) {
    //validavimas
    if (!email || !password) {
        throw Error('Visi laukeliai privalomi.')
    };

    if (!validator.isEmail(email)) {
        throw Error('El. paštas nėra tinkamas.')
    };

    if (!validator.isStrongPassword(password)) {
        throw Error('Slaptažodis per silpnas.')
    };

    const exists = await this.findOne({ email });

    if (exists) {
        throw Error('El. paštas jau naudojamas.')
    };
    
    // Generating salt and hashing the password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Creating a new user with hashed password and default admin status set to false
    const user = await this.create({ email, password: hash, isAdmin: false });
    return user;
}
userSchema.statics.login = async function (email, password) {
    if (!email || !password) {
        throw Error('Visi laukeliai privalomi.');
    };

    const user = await this.findOne({ email });

    if (!user) {
        throw Error('El. paštas neteisingas.');
    };

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw Error('Neteisingas slaptažodis.')
    };
    return user;
};

export default mongoose.model('User', userSchema);