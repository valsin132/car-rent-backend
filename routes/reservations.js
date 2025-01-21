import express from 'express';
import * as reservations from '../controllers/reservations.js';
import requireAuth from '../middleware/requireAuth.js';

const router = express.Router();
router.use(requireAuth);

// Route to get all reservations
router.get('/', reservations.getReservations);

// Route to get all unavailable resservation dates by car ID
router.get('/dates/:id', reservations.getUnavailableDates);

// Route to get a specific reservation by ID
router.get('/:id', reservations.getReservation);

// Route to update a specific reservation by ID
router.put('/:id', reservations.updateReservation);

// Route to create a new reservation
router.post('/', reservations.createReservation);

// Route to remove a specific reservation by ID
router.delete('/:id', reservations.removeReservation);

export default router;

