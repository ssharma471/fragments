const request = require('supertest');
//const express = require('express');
const app = require('../../src/app');

describe('Fragment Creation', () => {
  // Test for unauthenticated request
  it('should return 401 for unauthenticated requests', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .send('Some data')
      .set('Content-Type', 'text/plain');

    expect(response.status).toBe(401); // 401 is Unauthenticated
  });

  // Test for authenticated request
  it('should allow authenticated users to create a plain text fragment', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1') // Adjust with your basic auth details
      .set('Content-Type', 'text/plain')
      .send('This is a sample fragment.');

    // Check if the response status is 201 (Created)
    expect(response.status).toBe(201);
    // Check if the returned content type is text/plain
    expect(response.headers['content-type']).toContain('text/plain');
  });

  // Test for response properties
  it('should return expected properties for the fragment', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Some data');

    // Assuming the response is a stringified JSON, parse it
    const parsedResponseBody = JSON.parse(response.text);

    const fragment = parsedResponseBody.fragment;
    if (!fragment) {
      throw new Error('Fragment not found in response');
    }
    expect(fragment.id).toBeDefined();
    expect(fragment.created).toBeDefined();
    expect(fragment.type).toBe('text/plain');
  });
  it('should include a Location header', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('Some data');
    expect(response.headers.location).toBeDefined();
    expect(response.headers.location).toMatch(/\/fragments\/\w+/); // Matches /fragments/:id pattern
  });

  // Test for unsupported type
  it('should error out for unsupported type', async () => {
    const response = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'unsupported/type')
      .send('Some data');

    expect(response.status).toBe(415); // 415 is Unsupported Media Type
  });
});