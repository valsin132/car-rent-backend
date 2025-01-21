import mongoose from 'mongoose'



const Schema = mongoose.Schema

// Defining the car schema
const carSchema = new Schema({
    imageUrl: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    fuelType: {
        type: String,
        required: true
    },
    transmission: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        required: true
    },
    body: {
        type: String,
        required: true
    }
});

export default mongoose.model('Car', carSchema);
