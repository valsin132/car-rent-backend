import mongoose from 'mongoose';
import { getCars } from '../controllers/controller';
import { getCar } from '../controllers/controller';
import { createCar } from '../controllers/controller';
import { updateCar } from '../controllers/controller';
import { removeCar } from '../controllers/controller';
import { getTypes } from '../controllers/controller';
import Car from '../models/carModel';

describe('getCars function', () => {
  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Car.deleteMany({});
    await Car.create([
      {
        imageUrl: 'dummyImage1.jpg',
        model: 'DummyModel1',
        brand: 'DummyBrand1',
        price: 10000,
        year: 2022,
        fuelType: 'Gasoline',
        transmission: 'Automatic',
        seats: 5,
        body: 'Sedan',
      },
      {
        imageUrl: 'dummyImage2.jpg',
        model: 'DummyModel2',
        brand: 'DummyBrand2',
        price: 12000,
        year: 2021,
        fuelType: 'Electric',
        transmission: 'Manual',
        seats: 4,
        body: 'Hatchback',
      },
    ]);
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the getCars function
  it('should return an array of cars', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Call the getCars function
    await getCars({}, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with an array of cars
    expect(mockRes.json).toHaveBeenCalledWith(expect.any(Array));
  });
});

describe('getCar function', () => {
  let dummyCarId;

  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Car.deleteMany({});
    const dummyCar = await Car.create({
      imageUrl: 'dummyImage.jpg',
      model: 'DummyModel',
      brand: 'DummyBrand',
      price: 15000,
      year: 2023,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 7,
      body: 'SUV',
    });
    dummyCarId = dummyCar._id;
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the getCar function
  it('should return a single car by ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: dummyCarId.toString() },
    };

    // Call the getCar function
    await getCar(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the expected car object
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: expect.any(String),
      imageUrl: 'dummyImage.jpg',
      model: 'DummyModel',
      brand: 'DummyBrand',
      price: 15000,
      year: 2023,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 7,
      body: 'SUV',
    }));
  });

  // Test when an invalid ID is provided
  it('should return 404 with an error for an invalid car ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: 'invalidId' },
    };

    // Call the getCar function
    await getCar(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tokio automobilio nėra' });
  });
});

describe('createCar function', () => {
  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database before each test
  beforeEach(async () => {
    await Car.deleteMany({});
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the createCar function
  it('should create a new car and return it', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with the required body parameters
    const mockReq = {
      body: {
        imageUrl: 'testImage.jpg',
        model: 'TestModel',
        brand: 'TestBrand',
        price: 20000,
        year: 2024,
        fuelType: 'Gasoline',
        transmission: 'Manual',
        seats: 5,
        body: 'Sedan',
      },
    };

    // Call the createCar function
    await createCar(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the created car object
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: expect.any(String),
      imageUrl: 'testImage.jpg',
      model: 'TestModel',
      brand: 'TestBrand',
      price: 20000,
      year: 2024,
      fuelType: 'Gasoline',
      transmission: 'Manual',
      seats: 5,
      body: 'Sedan',
    }));
  });

  // Test when some required fields are missing
  it('should return 400 with an error for missing required fields', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with missing body parameters
    const mockReq = {
      body: {
        imageUrl: 'testImage.jpg',
        brand: 'TestBrand',
        price: 20000,
        year: 2024,
        fuelType: 'Gasoline',
        transmission: 'Manual',
        seats: 5,
        body: 'Sedan',
      },
    };

    // Call the createCar function
    await createCar(mockReq, mockRes);

    // Check if the status was set to 400
    expect(mockRes.status).toHaveBeenCalledWith(400);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Prašome užpildyti visus laukelius',
      emptyFields: ['modelis'],
    });
  });
});

describe('updateCar function', () => {
  let dummyCarId;

  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Car.deleteMany({});
    const dummyCar = await Car.create({
      imageUrl: 'dummyImage.jpg',
      model: 'DummyModel',
      brand: 'DummyBrand',
      price: 15000,
      year: 2023,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 7,
      body: 'SUV',
    });
    dummyCarId = dummyCar._id;
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the updateCar function
  it('should update an existing car and return it', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters and body updates
    const mockReq = {
      params: { id: dummyCarId.toString() },
      body: {
        imageUrl: 'updatedImage.jpg',
        model: 'UpdatedModel',
        brand: 'UpdatedBrand',
        price: 18000,
        year: 2022,
        fuelType: 'Electric',
        transmission: 'Manual',
        seats: 5,
        body: 'Hatchback',
      },
    };

    // Call the updateCar function
    await updateCar(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the updated car object
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: dummyCarId.toString(),
      imageUrl: 'updatedImage.jpg',
      model: 'UpdatedModel',
      brand: 'UpdatedBrand',
      price: 18000,
      year: 2022,
      fuelType: 'Electric',
      transmission: 'Manual',
      seats: 5,
      body: 'Hatchback',
    }));
  });

  // Test when an invalid ID is provided
  it('should return 404 with an error for an invalid car ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: 'invalidId' },
      body: {
        imageUrl: 'updatedImage.jpg',
        model: 'UpdatedModel',
        brand: 'UpdatedBrand',
        price: 18000,
        year: 2022,
        fuelType: 'Electric',
        transmission: 'Manual',
        seats: 5,
        body: 'Hatchback',
      },
    };

    // Call the updateCar function
    await updateCar(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tokio automobilio nėra' });
  });

  // Test when some required fields are missing in the update
  it('should return 400 with an error for missing required fields in the update', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters and missing body updates
    const mockReq = {
      params: { id: dummyCarId.toString() },
      body: {
        imageUrl: 'updatedImage.jpg',
        brand: 'UpdatedBrand',
        price: 18000,
        year: 2022,
        fuelType: 'Electric',
        transmission: 'Manual',
        seats: 5,
        body: 'Hatchback',
      },
    };

    // Call the updateCar function
    await updateCar(mockReq, mockRes);

    // Check if the status was set to 400
    expect(mockRes.status).toHaveBeenCalledWith(400);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Prašome užpildyti visus laukelius',
      emptyFields: ['modelis'],
    });
  });
});

describe('removeCar function', () => {
  let dummyCarId;

  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Car.deleteMany({});
    const dummyCar = await Car.create({
      imageUrl: 'dummyImage.jpg',
      model: 'DummyModel',
      brand: 'DummyBrand',
      price: 15000,
      year: 2023,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 7,
      body: 'SUV',
    });
    dummyCarId = dummyCar._id;
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the removeCar function
  it('should remove an existing car and return it', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: dummyCarId.toString() },
    };

    // Call the removeCar function
    await removeCar(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the removed car object
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: dummyCarId.toString(),
      imageUrl: 'dummyImage.jpg',
      model: 'DummyModel',
      brand: 'DummyBrand',
      price: 15000,
      year: 2023,
      fuelType: 'Diesel',
      transmission: 'Automatic',
      seats: 7,
      body: 'SUV',
    }));
  });

  // Test when an invalid ID is provided
  it('should return 404 with an error for an invalid car ID', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with parameters
    const mockReq = {
      params: { id: 'invalidId' },
    };

    // Call the removeCar function
    await removeCar(mockReq, mockRes);

    // Check if the status was set to 404
    expect(mockRes.status).toHaveBeenCalledWith(404);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Tokio automobilio nėra' });
  });
});

describe('getTypes function', () => {
  // Establish a connection to the MongoDB test database before running the tests
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // Clear the database and insert dummy data before each test
  beforeEach(async () => {
    await Car.deleteMany({});
    await Car.create([
      { imageUrl: 'image1.jpg', model: 'ModelA', brand: 'BrandA', body: 'Sedan' },
      { imageUrl: 'image2.jpg', model: 'ModelB', brand: 'BrandB', body: 'Hatchback' },
      { imageUrl: 'image3.jpg', model: 'ModelC', brand: 'BrandC', body: 'SUV' },
    ]);
  });

  // Disconnect from the test database after running the tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Test the getTypes function
  it('should return an array of unique car body types', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with no parameters
    const mockReq = {};

    // Call the getTypes function
    await getTypes(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the expected array of body types
    expect(mockRes.json).toHaveBeenCalledWith([
      { _id: 'Sedan' },
      { _id: 'Hatchback' },
      { _id: 'SUV' },
    ]);
  });

  // Test when an error occurs in the database query
  it('should return 500 with an error message for a database error', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with no parameters
    const mockReq = {};

    // Mock the Car.aggregate function to throw an error
    jest.spyOn(Car, 'aggregate').mockImplementationOnce(() => {
      throw new Error('Database error');
    });

    // Call the getTypes function
    await getTypes(mockReq, mockRes);

    // Check if the status was set to 500
    expect(mockRes.status).toHaveBeenCalledWith(500);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith('Serverio klaida');
  });
});