import mongoose from 'mongoose';


const Schema = mongoose.Schema
// Defining the reservation schema
const reservationSchema = new Schema({
    car_id: {
        type: String
    },
    carTitle: {
        type: String
    },
    dateRented: {
        type: Date
    },
    dateReturned: {
        type: Date
    },
    user_id: {
        type: String
    },
    email: {
        type: String
    },
    status: {
        type: String
    }
});

export default mongoose.model('Reservation', reservationSchema);