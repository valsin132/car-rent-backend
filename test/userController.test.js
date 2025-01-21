import { createToken } from '../controllers/userController';
import { loginUser } from '../controllers/userController';
import User from '../models/userModel';

describe('createToken function', () => {
  // Test the createToken function
  it('should create a valid JSON Web Token (JWT) with the user ID as payload', () => {
    // Mock user ID
    const userId = 'dummyUserId';

    // Call the createToken function
    const token = createToken(userId);

    // Verify that the token is a string
    expect(typeof token).toBe('string');

    // Verify that the token has three parts (header, payload, signature)
    const tokenParts = token.split('.');
    expect(tokenParts.length).toBe(3);

    // Verify that the payload is a valid base64-encoded JSON object
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString('utf-8'));
    expect(payload).toEqual({ _id: userId });

    // Verify that the token expires in 3 days (within a reasonable tolerance)
    const expiresIn = payload.exp - payload.iat;
    const threeDaysInSeconds = 3 * 24 * 60 * 60;
    expect(expiresIn).toBeCloseTo(threeDaysInSeconds, -1); // Tolerance of 1 second
  });
});

jest.mock('../models/userModel', () => ({
  login: jest.fn(),
}));

describe('loginUser function', () => {
  // Test the loginUser function
  it('should log in a user and return a valid token and user details', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with user credentials
    const mockReq = {
      body: {
        email: 'dummy@example.com',
        password: 'dummyPassword',
      },
    };

    // Mock User.login method to return a user
    User.login.mockResolvedValueOnce({
      _id: 'dummyUserId',
      email: 'dummy@example.com',
      isAdmin: false,
    });

    // Call the loginUser function
    await loginUser(mockReq, mockRes);

    // Check if the status was set to 200
    expect(mockRes.status).toHaveBeenCalledWith(200);

    // Check if the json method was called with the expected user details and token
    expect(mockRes.json).toHaveBeenCalledWith({
      email: 'dummy@example.com',
      token: expect.any(String),
      isAdmin: false,
    });
  });

  // Test when email or password is not provided
  it('should return 400 with an error for missing email or password', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object without email
    const mockReqWithoutEmail = {
      body: {
        password: 'dummyPassword',
      },
    };

    // Call the loginUser function
    await loginUser(mockReqWithoutEmail, mockRes);

    // Check if the status was set to 400
    expect(mockRes.status).toHaveBeenCalledWith(400);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Nesuvesti duomenys' });

    // Mock Express request object without password
    const mockReqWithoutPassword = {
      body: {
        email: 'dummy@example.com',
      },
    };

    // Call the loginUser function
    await loginUser(mockReqWithoutPassword, mockRes);

    // Check if the status was set to 400
    expect(mockRes.status).toHaveBeenCalledWith(400);

    // Check if the json method was called with an error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Nesuvesti duomenys' });
  });

  // Test when User.login method throws an error
  it('should return 400 with an error when User.login method throws an error', async () => {
    // Mock Express response object
    const mockRes = {
      status: jest.fn(() => mockRes),
      json: jest.fn(),
    };

    // Mock Express request object with user credentials
    const mockReq = {
      body: {
        email: 'dummy@example.com',
        password: 'dummyPassword',
      },
    };

    // Mock User.login method to throw an error
    User.login.mockRejectedValueOnce(new Error('Invalid credentials'));

    // Call the loginUser function
    await loginUser(mockReq, mockRes);

    // Check if the status was set to 400
    expect(mockRes.status).toHaveBeenCalledWith(400);

    // Check if the json method was called with the error message
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });
});