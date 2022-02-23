import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app';

beforeAll(async () => {
  await mongoose.connect(<string>process.env.MONGO_URI_TEST);
});

describe('GET /api/v1/rest_service_name', () => {
  test('should return 200 OK', () => {
    return request(app).get('/api/v1/rest_service_name').expect(200);
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});
