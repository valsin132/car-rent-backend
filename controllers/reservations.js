import Reservation from '../models/reservationModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

const validateReservation = (reservation) => {
    const { car_id, carTitle, dateRented, dateReturned } = reservation;

    let invalidInputs = [];
    if (!car_id) { invalidInputs.push('pasirinkite automobilį') };
    if (!carTitle) { invalidInputs.push('pasirinkite automobilį') };
    if (!dateRented) { invalidInputs.push('pasirinkite nuomos datą') };
    if (!dateReturned) { invalidInputs.push('pasirinkite grąžinimo datą') };

    return invalidInputs;
};

// Controller function to get reservations based on user role (admin or regular user)
export const getReservations = async (req, res) => {
    const user_id = req.user._id;
    const userCheck = await User.findById(user_id);

    if (userCheck.isAdmin) {
        try {
            const reservations = await Reservation.find({}).sort({ dateRented: -1 });
            res.status(200).json(reservations);
        } catch (err) {
            return res.status(500).send('Serverio klaida');
        };
    } else {
        try {
            const reservations = await Reservation.find({ user_id }).sort({ dateRented: -1 });
            res.status(200).json(reservations);
        } catch (err) {
            return res.status(500).send('Serverio klaida');
        };
    };
};

// Controller function to get a single reservation by ID
export const getReservation = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Tokios rezervacijos nėra" });
    };

    try {
        const reservation = await Reservation.findById(id);

        if (!reservation) {
            return res.status(404).json({ error: 'Tokios rezervacijos nėra' });
        };
        res.status(200).json(reservation);
    } catch (err) {
        return res.status(500).send('Serverio klaida');
    };
};

// Controller function to create a new reservation
export const createReservation = async (req, res) => {
    const invalidInputs = validateReservation(req.body);
    if (invalidInputs.length > 0) {
        return res.status(400).json({ error: 'Prašome užpildyti visus laukelius', invalidInputs });
    };

    try {
        const userObj = await User.findById(req.user._id);
        const reservation = await Reservation.create(
            {
                ...req.body,
                user_id: req.user._id,
                email: userObj.email,
                status: 'pending'
            });
        res.status(200).json(reservation);

    } catch (error) {
        return res.status(500).json('Serverio klaida');
    };
};

// Controller function to update an existing reservation
export const updateReservation = async (req, res) => {
    const { id } = req.params
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Tokios rezervacijos nėra' });
    };

    let invalidInputs = validateReservation(req.body);
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(req.body.status)) { invalidInputs.push('pasirinkite statusą') };

    if (invalidInputs.length > 0) {
        return res.status(400).json({ error: 'Prašome užpildyti visus laukelius', invalidInputs });
    };

    try {
        const reservation = await Reservation.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
        if (!reservation) {
            return res.status(404).json({ error: 'Paredaguoti rezervacijos nepavyko' });
        };
        res.status(200).json(reservation);
    } catch (err) {
        return res.status(500).json('Serverio klaida');
    };
};

// Controller function to remove a reservation by ID
export const removeReservation = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Tokios rezervacijos nėra' });
    };

    try {
        const reservation = await Reservation.findByIdAndDelete({ _id: id });
        if (!reservation) {
            return res.status(404).json({ error: 'Tokios rezervacijos nėra.' });
        };
        res.status(200).json(reservation);
    } catch (err) {
        return res.status(500).send('Serverio klaida');
    };
};

export const getUnavailableDates = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Tokio automobilio nėra' });
    };

    try {
        const allReservationsByCarId = await Reservation.find({ car_id: id });

        // data for an array of taken dates in Car model:
        Date.prototype.addDays = function (days) {
            const dat = new Date(this.valueOf())
            dat.setDate(dat.getDate() + days);
            return dat;
        };

        function getDates(startDate, stopDate) {
            const dateArray = new Array();
            let currentDate = startDate;
            while (currentDate <= stopDate) {
                dateArray.push(new Date(currentDate));
                currentDate = currentDate.addDays(1);
            };

            return dateArray;
        };

        let takenDates = [];

        for (let reservation of allReservationsByCarId) {
            const startDate = new Date(reservation.dateRented);
            const endDate = new Date(reservation.dateReturned);

            if (endDate > startDate) {
                takenDates.push(getDates(startDate, endDate));
            };
        };

        res.status(200).json(takenDates.flat());

    } catch (e) {
        res.status(500).send('Serverio klaida');
    };
};

