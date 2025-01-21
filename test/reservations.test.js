import mongoose from 'mongoose';
import { getReservations } from '../controllers/reservations';
import { getReservation } from '../controllers/reservations';
import { createReservation } from '../controllers/reservations';
import { updateReservation } from '../controllers/reservations';
import { removeReservation } from '../controllers/reservations';
import Reservation from '../models/reservationModel';
import User from '../models/userModel';

describe('getReservations function', () => {
  let adminUserId;
  let regularUserId;

  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Reservation.deleteMany({});
    await User.deleteMany({});

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@example.com',
      password: 'adminpassword',
      isAdmin: true,
    });
    adminUserId = adminUser._id;

    // Create regular user
    const regularUser = await User.create({
      email: 'user@example.com',
      password: 'userpassword',
      isAdmin: false,
    });
    regularUserId = regularUser._id;

    // Create reservations
    await Reservation.create([
      { car_id: 'car1', carTitle: 'Car 1', dateRented: new Date(), user_id: adminUserId, email: 'admin@example.com', status: 'confirmed' },
      { car_id: 'car2', carTitle: 'Car 2', dateRented: new Date(), user_id: regularUserId, email: 'user@example.com', status: 'pending' },
    ]);
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the getReservations function for an admin user
  it('should return all reservations for an admin user', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with an admin user
    const mockReq = {
      user: { _id: adminUserId, isAdmin: true },
    };

    // Call the getReservations function
    await getReservations(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the array of reservations
    expect(mockRes.json).toHaveBeenCalledWith([
      { car_id: 'car1', carTitle: 'Car 1', dateRented: expect.any(Date), user_id: adminUserId, email: 'admin@example.com', status: 'confirmed' },
      { car_id: 'car2', carTitle: 'Car 2', dateRented: expect.any(Date), user_id: regularUserId, email: 'user@example.com', status: 'pending' },
    ]);
  });

  // Test the getReservations function for a regular user
  it('should return reservations for a regular user based on user_id', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with a regular user
    const mockReq = {
      user: { _id: regularUserId, isAdmin: false },
    };

    // Call the getReservations function
    await getReservations(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the array of reservations for the regular user
    expect(mockRes.json).toHaveBeenCalledWith([
      { car_id: 'car2', carTitle: 'Car 2', dateRented: expect.any(Date), user_id: regularUserId, email: 'user@example.com', status: 'pending' },
    ]);
  });

  // Test when an error occurs in the database query
  it('should return 500 with an error message for a database error', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with an admin user
    const mockReq = {
      user: { _id: adminUserId, isAdmin: true },
    };

    // Mock the Reservation.find function to throw an error
    jest.spyOn(Reservation, 'find').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    // Call the getReservations function
    await getReservations(mockReq, mockRes);

    // Check if the status was set to 500
    expect(mockRes.status).toHaveBeenCalledWith(500);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith('Serverio klaida');
  });
});

describe('getReservation function', () => {
  let dummyReservationId;

  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Reservation.deleteMany({});
    const dummyReservation = await Reservation.create({
      car_id: 'dummyCarId',
      carTitle: 'DummyCar',
      dateRented: new Date(),
      dateReturned: new Date(),
      user_id: 'dummyUserId',
      email: 'dummy@example.com',
      status: 'confirmed',
    });
    dummyReservationId = dummyReservation._id;
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the getReservation function
  it('should return a specific reservation by ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: dummyReservationId.toString() },
    };

    // Call the getReservation function
    await getReservation(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the dummy reservation object
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: dummyReservationId.toString(),
      car_id: 'dummyCarId',
      carTitle: 'DummyCar',
      dateRented: expect.any(Date),
      dateReturned: expect.any(Date),
      user_id: 'dummyUserId',
      email: 'dummy@example.com',
      status: 'confirmed',
    }));
  });

  // Test when an invalid ID is provided
  it('should return 404 with an error for an invalid reservation ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: 'invalidId' },
    };

    // Call the getReservation function
    await getReservation(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Tokios rezervacijos nėra" });
  });

  // Test when the reservation with the provided ID is not found
  it('should return 404 with an error for a non-existing reservation ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: mongoose.Types.ObjectId().toString() },
    };

    // Call the getReservation function
    await getReservation(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tokios rezervacijos nėra' });
  });
});

describe('createReservation function', () => {
  let regularUserId;

  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Reservation.deleteMany({});
    await User.deleteMany({});

    // Create a regular user
    const regularUser = await User.create({
      email: 'user@example.com',
      password: 'userpassword',
      isAdmin: false,
    });
    regularUserId = regularUser._id;
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the createReservation function
  it('should create a new reservation and return it', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with user and reservation data
    const mockReq = {
      user: { _id: regularUserId },
      body: {
        car_id: 'car1',
        carTitle: 'Car 1',
        dateRented: new Date(),
        dateReturned: new Date(),
      },
    };

    // Call the createReservation function
    await createReservation(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the created reservation object
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: expect.any(String),
      car_id: 'car1',
      carTitle: 'Car 1',
      dateRented: expect.any(Date),
      dateReturned: expect.any(Date),
      user_id: regularUserId.toString(),
      email: expect.any(String),
      status: 'laukiama',
    }));
  });

  // Test when required fields are missing
  it('should return 400 with an error for missing required fields', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with user and incomplete reservation data
    const mockReq = {
      user: { _id: regularUserId },
      body: { car_id: 'car1' },
    };

    // Call the createReservation function
    await createReservation(mockReq, mockRes);

    // Check if the status was set to 400
    expect(mockRes.status).toHaveBeenCalledWith(400);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Prašome užpildyti visus laukelius',
      emptyFields: ['pasirinkite automobilį', 'pasirinkite nuomos datą', 'pasirinkite grąžinimo datą'],
    });
  });

  // Test when there is a database error
  it('should return 500 with an error message for a database error', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with user and reservation data
    const mockReq = {
      user: { _id: regularUserId },
      body: {
        car_id: 'car1',
        carTitle: 'Car 1',
        dateRented: new Date(),
        dateReturned: new Date(),
      },
    };

    // Mock the Reservation.create function to throw an error
    jest.spyOn(Reservation, 'create').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    // Call the createReservation function
    await createReservation(mockReq, mockRes);

    // Check if the status was set to 500
    expect(mockRes.status).toHaveBeenCalledWith(500);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith('Serverio klaida');
  });
});

describe('updateReservation function', () => {
  let dummyReservationId;

  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Reservation.deleteMany({});
    const dummyReservation = await Reservation.create({
      car_id: 'dummyCarId',
      carTitle: 'DummyCar',
      dateRented: new Date(),
      dateReturned: new Date(),
      user_id: 'dummyUserId',
      email: 'dummy@example.com',
      status: 'confirmed',
    });
    dummyReservationId = dummyReservation._id;
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the updateReservation function
  it('should update an existing reservation and return it', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: dummyReservationId.toString() },
      body: {
        car_id: 'updatedCarId',
        carTitle: 'UpdatedCar',
        dateRented: new Date(),
        dateReturned: new Date(),
        status: 'completed',
      },
    };

    // Call the updateReservation function
    await updateReservation(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the updated reservation object
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: dummyReservationId.toString(),
      car_id: 'updatedCarId',
      carTitle: 'UpdatedCar',
      dateRented: expect.any(Date),
      dateReturned: expect.any(Date),
      user_id: 'dummyUserId',
      email: 'dummy@example.com',
      status: 'completed',
    }));
  });

  // Test when an invalid ID is provided
  it('should return 404 with an error for an invalid reservation ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: 'invalidId' },
      body: { car_id: 'updatedCarId' },
    };

    // Call the updateReservation function
    await updateReservation(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tokios rezervacijos nėra' });
  });

  // Test when the reservation with the provided ID is not found
  it('should return 404 with an error for a non-existing reservation ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: mongoose.Types.ObjectId().toString() },
      body: { car_id: 'updatedCarId' },
    };

    // Call the updateReservation function
    await updateReservation(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tokios rezervacijos nėra' });
  });

  // Test when there are validation errors in the request body
  it('should return 400 with an error for validation errors in the request body', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters and validation error
    const mockReq = {
      params: { id: dummyReservationId.toString() },
      body: { car_id: 'updatedCarId', status: 'invalidStatus' },
    };

    // Call the updateReservation function
    await updateReservation(mockReq, mockRes);

    // Check if the status was set to 400
    expect(mockRes.status).toHaveBeenCalledWith(400);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Prašome užpildyti visus laukelius',
      emptyFields: ['pasirinkite automobilį', 'pasirinkite nuomos datą', 'pasirinkite grąžinimo datą', 'pasirinkite statusą'],
    });
  });
});

describe('removeReservation function', () => {
  let dummyReservationId;

  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Reservation.deleteMany({});
    const dummyReservation = await Reservation.create({
      car_id: 'dummyCarId',
      carTitle: 'DummyCar',
      dateRented: new Date(),
      dateReturned: new Date(),
      user_id: 'dummyUserId',
      email: 'dummy@example.com',
      status: 'confirmed',
    });
    dummyReservationId = dummyReservation._id;
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the removeReservation function
  it('should remove an existing reservation and return it', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: dummyReservationId.toString() },
    };

    // Call the removeReservation function
    await removeReservation(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the removed reservation object
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: dummyReservationId.toString(),
      car_id: 'dummyCarId',
      carTitle: 'DummyCar',
      dateRented: expect.any(Date),
      dateReturned: expect.any(Date),
      user_id: 'dummyUserId',
      email: 'dummy@example.com',
      status: 'confirmed',
    }));
  });

  // Test when an invalid ID is provided
  it('should return 404 with an error for an invalid reservation ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: 'invalidId' },
    };

    // Call the removeReservation function
    await removeReservation(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tokios rezervacijos nėra' });
  });

  // Test when the reservation with the provided ID is not found
  it('should return 404 with an error for a non-existing reservation ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: mongoose.Types.ObjectId().toString() },
    };

    // Call the removeReservation function
    await removeReservation(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tokios rezervacijos nėra' });
  });
});