import request from 'supertest';
import app from '../app';

export const isNumber = (n: any) => {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

describe('GET /api/v1', () => {
  test('should return 200 OK', () => {
    return request(app).get('/').expect(200);
  });
});
