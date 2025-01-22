import Car from '../models/carModel.js';
import mongoose from 'mongoose';

const validateCar = (vehicle) => {
    const { imageUrl, model, brand, price, year, fuelType, transmission, seats, body } = vehicle;
    let invalidInputs = [];

    if (!imageUrl) { invalidInputs.push('paveikslėlio nuoroda') };
    if (!model) { invalidInputs.push('modelis') };
    if (!brand) { invalidInputs.push('markė') };
    if (!price) { invalidInputs.push('kaina') };
    if (!year) { invalidInputs.push('metai') };
    if (!fuelType) { invalidInputs.push('kuro tipas') };
    if (!transmission) { invalidInputs.push('pavarų dėžė') };
    if (!seats) { invalidInputs.push('vietos') };
    if (!body) { invalidInputs.push('kėbulas') };

    return invalidInputs;
};

// Controller function to get all cars
export const getCars = async (req, res) => {
    try {
        const cars = await Car.find({});
        res.status(200).json(cars);
    } catch (err) {
        return res.status(500).send('Serverio klaida')
    };
};

// Controller function to get a single car by ID
export const getCar = async (req, res) => {
    const { id } = req.params;

    // Check if the provided ID is a valid mongoose ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Tokio automobilio nėra" })
    };

    try {
        const car = await Car.findById(id);
        if (!car) {
            return res.status(404).json({ error: 'Tokio automobilio nėra.' })
        };
        res.status(200).json(car);
    } catch (err) {
        return res.status(500).send('Serverio klaida');
    };
};

// Controller function to create a new car
export const createCar = async (req, res) => {
    const invalidInputs = validateCar(req.body);
    if (invalidInputs.length > 0) {
        return res.status(400).json({ error: 'Prašome užpildyti visus laukelius', invalidInputs });
    };

    try {
        const car = await Car.create(req.body);
        res.status(200).json(car);
    } catch (error) {
        res.status(500).send('Serverio klaida');
    };
};

// Controller function to update an existing car
export const updateCar = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Tokio automobilio nėra' });
    };

    const invalidInputs = validateCar(req.body);
    if (invalidInputs.length > 0) {
        return res.status(400).json({ error: 'Prašome užpildyti visus laukelius', invalidInputs });
    }

    try {
        const car = await Car.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
        if (!car) {
            return res.status(404).json({ error: 'Tokio automobilio nėra' });
        };
        res.status(200).json(car);
    } catch (err) {
        res.status(500).send('Serverio klaida');
    };
};

// Controller function to remove a car by ID
export const removeCar = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Tokio automobilio nėra' });
    };

    try {
        const car = await Car.findByIdAndDelete({ _id: id });
        if (!car) {
            return res.status(404).json({ error: 'Tokio automobilio nėra.' });
        };
        res.status(200).json(car);
    } catch (err) {
        res.status(500).send('Serverio klaida');
    };
};

// Controller function to get unique car body types
export const getTypes = async (req, res) => {
    try {
        const types = await Car.aggregate([
            { $unwind: "$body" },
            { $group: { _id: "$body" } }
        ]);

        return res.status(200).json(types);

    } catch (err) {
        console.error(err);
        return res.status(500).send("Serverio klaida");
    };
};




