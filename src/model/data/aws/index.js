// const MemoryDB = require('./memory-db');
const MemoryDB = require('../memory/memory-db');
const s3Client = require('./s3Client');
const { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const logger = require('../../../logger'); // Adjust the path based on your project structure
// const s3Client = require('./s3Client');
// eslint-disable-next-line no-unused-vars
const ddbDocClient = require('./ddbDocClient');
// const { PutCommand } = require('@aws-sdk/lib-dynamodb');
// const { PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { PutCommand, GetCommand, QueryCommand,DeleteCommand } = require('@aws-sdk/lib-dynamodb');
// const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
// Create two in-memory databases: one for fragment metadata and the other for raw data
// const data = new MemoryDB();
// eslint-disable-next-line no-unused-vars
const metadata = new MemoryDB();

// If the environment sets an AWS Region, we'll use AWS backend
// services (S3, DynamoDB); otherwise, we'll use an in-memory db.
const backend = process.env.AWS_REGION ? require('./aws') : require('./memory');

// Write a fragment's metadata to memory db. Returns a Promise
// function writeFragment(fragment) {
//   return metadata.put(fragment.ownerId, fragment.id, fragment);
// }

// Writes a fragment to DynamoDB. Returns a Promise.
function writeFragment(fragment) {
  // Configure our PUT params, with the name of the table and item (attributes and keys)
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Item: fragment,
  };

  // Create a PUT command to send to DynamoDB
  const command = new PutCommand(params);

  try {
    return ddbDocClient.send(command);
  } catch (err) {
    logger.warn({ err, params, fragment }, 'error writing fragment to DynamoDB');
    throw err;
  }
}



// Read a fragment's metadata from memory db. Returns a Promise
// const streamToBuffer = (stream) =>
//   new Promise((resolve, reject) => {
//     // As the data streams in, we'll collect it into an array.
//     const chunks = [];

//     // Streams have events that we can listen for and run
//     // code.  We need to know when new `data` is available,
//     // if there's an `error`, and when we're at the `end`
//     // of the stream.

//     // When there's data, add the chunk to our chunks list
//     stream.on('data', (chunk) => chunks.push(chunk));
//     // When there's an error, reject the Promise
//     stream.on('error', reject);
//     // When the stream is done, resolve with a new Buffer of our chunks
//     stream.on('end', () => resolve(Buffer.concat(chunks)));
//   });


// Reads a fragment from DynamoDB. Returns a Promise<fragment|undefined>
async function readFragment(ownerId, id) {
  // Configure our GET params, with the name of the table and key (partition key + sort key)
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a GET command to send to DynamoDB
  // eslint-disable-next-line no-undef
  const command = new GetCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);
    // We may or may not get back any data (e.g., no item found for the given key).
    // If we get back an item (fragment), we'll return it.  Otherwise we'll return `undefined`.
    return data?.Item;
  } catch (err) {
    logger.warn({ err, params }, 'error reading fragment from DynamoDB');
    throw err;
  }
}
// Reads a fragment's data from S3 and returns (Promise<Buffer>)
async function readFragmentData(ownerId, id) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
  };

  // Create a GET Object command to send to S3
  const command = new GetObjectCommand(params);

  try {
    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await s3Client.send(command);
    // Convert the ReadableStream to a Buffer
    // eslint-disable-next-line no-undef
    return streamToBuffer(data.Body);
  } catch (err) {
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error streaming fragment data from S3');
    throw new Error('unable to read fragment data');
  }
}

// Write a fragment's data buffer to S3. Returns a Promise
async function writeFragmentData(ownerId, id, data) {
  // Create the PUT API params from our details
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    // Our key will be a mix of the ownerID and fragment id, written as a path
    Key: `${ownerId}/${id}`,
    Body: data,
  };

  // Create a PUT Object command to send to S3
  const command = new PutObjectCommand(params);

  try {
    // Use our client to send the command
    await s3Client.send(command);
  } catch (err) {
    // If anything goes wrong, log enough info that we can debug
    const { Bucket, Key } = params;
    logger.error({ err, Bucket, Key }, 'Error uploading fragment data to S3');
    throw new Error('unable to upload fragment data');
  }
}

// Read a fragment's data from memory db. Returns a Promise
// function readFragmentData(ownerId, id) {
//   return data.get(ownerId, id);
// }

// Get a list of fragment ids/objects for the given user from memory db. Returns a Promise
// async function listFragments(ownerId, expand = false) {
//   const fragments = await metadata.query(ownerId);

//   // If we don't get anything back, or are supposed to give expanded fragments, return
//   if (expand || !fragments) {
//     return fragments;
//   }

//   // Otherwise, map to only send back the ids
//   return fragments.map((fragment) => fragment.id);
// }



// Get a list of fragments, either ids-only, or full Objects, for the given user.
// Returns a Promise<Array<Fragment>|Array<string>|undefined>
async function listFragments(ownerId, expand = false) {
  // Configure our QUERY params, with the name of the table and the query expression
  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    // Specify that we want to get all items where the ownerId is equal to the
    // `:ownerId` that we'll define below in the ExpressionAttributeValues.
    KeyConditionExpression: 'ownerId = :ownerId',
    // Use the `ownerId` value to do the query
    ExpressionAttributeValues: {
      ':ownerId': ownerId,
    },
  };

  // Limit to only `id` if we aren't supposed to expand. Without doing this
  // we'll get back every attribute.  The projection expression defines a list
  // of attributes to return, see:
  // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.ProjectionExpressions.html
  if (!expand) {
    params.ProjectionExpression = 'id';
  }

  // Create a QUERY command to send to DynamoDB
  const command = new QueryCommand(params);

  try {
    // Wait for the data to come back from AWS
    const data = await ddbDocClient.send(command);

    // If we haven't expanded to include all attributes, remap this array from
    // [ {"id":"b9e7a264-630f-436d-a785-27f30233faea"}, {"id":"dad25b07-8cd6-498b-9aaf-46d358ea97fe"} ,... ] to
    // [ "b9e7a264-630f-436d-a785-27f30233faea", "dad25b07-8cd6-498b-9aaf-46d358ea97fe", ... ]
    return !expand ? data?.Items.map((item) => item.id) : data?.Items
  } catch (err) {
    logger.error({ err, params }, 'error getting all fragments for user from DynamoDB');
    throw err;
  }
}
// Delete a fragment's metadata and data from S3. Returns a Promise
// async function deleteFragment(ownerId, id) {
//   // Create the DELETE API params from our details
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME,
//     // Our key will be a mix of the ownerId and fragment id, written as a path
//     Key: `${ownerId}/${id}`,
//   };

//   // Create a DELETE Object command to send to S3
//   const command = new DeleteObjectCommand(params);

//   try {
//     // Use the S3 client to send the command
//     await s3Client.send(command);
//   } catch (err) {
//     const { Bucket, Key } = params;
//     logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
//     throw new Error('Unable to delete fragment data');
//   }

//   // Use the backend for metadata deletion
//   return backend.deleteFragment(ownerId, id);
// }


// Delete a fragment's metadata and data from S3 and DynamoDB. Returns a Promise
async function deleteFragment(ownerId, id) {
  // Create the DELETE API params from our details for S3
  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `${ownerId}/${id}`,
  };

  // Create a DELETE Object command to send to S3
  const s3Command = new DeleteObjectCommand(s3Params);

  try {
    // Use the S3 client to send the command and delete the fragment data from S3
    await s3Client.send(s3Command);
  } catch (err) {
    const { Bucket, Key } = s3Params;
    logger.error({ err, Bucket, Key }, 'Error deleting fragment data from S3');
    throw new Error('Unable to delete fragment data');
  }

  // Create the DELETE command params for DynamoDB
  const ddbParams = {
    TableName: process.env.AWS_DYNAMODB_TABLE_NAME,
    Key: { ownerId, id },
  };

  // Create a DELETE command to send to DynamoDB
  const ddbCommand = new DeleteCommand(ddbParams);

  try {
    // Use the DynamoDB Document Client to send the command and delete the fragment metadata from DynamoDB
    await ddbDocClient.send(ddbCommand);
  } catch (err) {
    logger.error({ err, TableName: ddbParams.TableName, Key: ddbParams.Key }, 'Error deleting fragment metadata from DynamoDB');
    throw new Error('Unable to delete fragment metadata');
  }

  // Use the backend for any additional cleanup if needed
  return backend.deleteFragment(ownerId, id);
}

module.exports = {
  writeFragment,
  readFragmentData,
  writeFragmentData,
  deleteFragment,
  listFragments,
};

module.exports.listFragments = listFragments;
module.exports.writeFragment = writeFragment;
module.exports.readFragment = readFragment;
module.exports.writeFragmentData = writeFragmentData;
module.exports.readFragmentData = readFragmentData;
module.exports.deleteFragment = deleteFragment;