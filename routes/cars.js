import express from 'express';
import * as controller from '../controllers/controller.js';

const router = express.Router();

// Route to get all cars
router.get('/', controller.getCars);

// Route to get all unique car types
router.get('/types', controller.getTypes);

// Route to get a specific car by ID
router.get('/:id', controller.getCar);

// Route to update a specific car by ID
router.put('/:id', controller.updateCar);

// Route to create a new car
router.post('/', controller.createCar);

// Route to remove a specific car by ID
router.delete('/:id', controller.removeCar);

// Exporting the router to be used in other parts of the application
export default router;