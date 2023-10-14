//src/model/fragments.js

const { randomUUID } = require('crypto');
const contentType = require('content-type');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({
    id = randomUUID(),
    ownerId,
    created = Date.now(),
    updated = Date.now(),
    type,
    size = 0,
  }) {
    // Check required fields
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }

    // Validate type
    if (!Fragment.isSupportedType(type)) {
      throw new Error('Invalid type');
    }

    // Validate size
    if (typeof size !== 'number' || size < 0) {
      throw new Error('Size must be a non-negative number');
    }

    this.id = id;
    this.ownerId = ownerId;
    this.created = new Date(created).toISOString();
    this.updated = new Date(updated).toISOString();
    this.type = type;
    this.size = size;
  }

  static async byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error('Fragment not found');
    }
    return fragment;
  }

  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  async save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  async setData(data) {
    this.size = data.length;
    this.updated = new Date().toISOString();
    await writeFragmentData(this.ownerId, this.id, data);
  }

  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  get isText() {
    return this.mimeType.startsWith('text/');
  }

  get formats() {
    return this.mimeType === 'text/plain' ? ['text/plain'] : [];
  }

  static isSupportedType(value) {
    // Basic check: (You can extend this based on supported types)
    try {
      const { type } = contentType.parse(value);
      return ['text/plain', 'text/html'].includes(type);
      //return type === 'text/plain';
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;
