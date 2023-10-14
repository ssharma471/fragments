// Import the MemoryDB class from your project's source code
const MemoryDB = require('../../src/model/data/memory/memory-db');

describe('MemoryDB', () => {
  let db;

  // Each test will get its own, empty database instance
  beforeEach(() => {
    db = new MemoryDB();
  });

  test('put() stores data and del() removes it', async () => {
    // Data to be stored
    const data = { key: 'sample', value: 'test' };

    // Store the data using put()
    await db.put('a', 'b', data);

    // Retrieve the stored data using get() to verify it's there
    const retrievedData = await db.get('a', 'b');
    expect(retrievedData).toEqual(data);

    // Remove the data using del()
    await db.del('a', 'b');

    // Attempt to retrieve the data again using get() should return undefined
    const deletedData = await db.get('a', 'b');
    expect(deletedData).toBe(undefined);
  });
});
