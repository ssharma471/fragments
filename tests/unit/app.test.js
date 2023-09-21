const request = require('supertest');
const app = require('../../src/app');

describe('404 Handler', () => {
  test('responds with 404 for unknown route', async () => {
    const response = await request(app).get('/non-existent-route'); // Replace with a route that doesn't exist
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: 'error',
      error: {
        message: 'not found',
        code: 404,
      },
    });
  });
});
