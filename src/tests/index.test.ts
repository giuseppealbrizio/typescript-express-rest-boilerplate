import request from 'supertest';
import app from '../app';

export const isNumber = (n: any) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

describe('GET /api/v1/servicename', () => {
  test('should return 200 OK', () => {
    return request(app).get('/api/v1/servicename').expect(200);
  });
});
