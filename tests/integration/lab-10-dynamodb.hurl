# Step 1: POST a new JSON fragment as an authorized user
POST http://localhost:8080
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: application/json
Body: { "service": "DynamoDB" }

# Check that the server returns a 201

# Capture the Location header value and fragment's id
# fragment1_url should be set to the Location header
# fragment1_id should be set to the id from the response JSON

# Step 2: GET the fragment info for the first fragment
GET http://localhost:8080/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Check that the server returns a 200 and metadata properties match expectations
# Verify that the service property in the response JSON is "DynamoDB"

# Step 3: POST a second Markdown fragment as the same authorized user
POST http://localhost:8080
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==
Content-Type: text/markdown
Body: DynamoDB is **great**.

# Check that the server returns a 201

# Capture the Location header value and the second id
# fragment2_url should be set to the Location header
# fragment2_id should be set to the id from the response JSON

# Step 4: GET the fragment info for the second fragment
GET http://localhost:8080/info
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Check that the server returns a 200 and metadata properties match expectations
# Verify that the content property in the response JSON is "DynamoDB is **great**."

# Step 5: GET all fragments for the authorized user without expanding
GET http://localhost:8080
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Check that the list of fragments includes the two id values
# Verify that both fragment1_id and fragment2_id are present in the response JSON

# Step 6: DELETE the first fragment
DELETE http://localhost:8080

Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Confirm that the server returns a 200

# Step 7: Try to GET the first fragment again
GET http://localhost:8080
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Confirm that the server returns a 404

# Step 8: GET all fragments for the same authorized user without expanding a second time
GET http://localhost:8080
Authorization: Basic dXNlcjFAZW1haWwuY29tOnBhc3N3b3JkMQ==

# Check that the first id is NOT included, but the second id is
# Verify that fragment1_id is not present, but fragment2_id is present in the response JSON
