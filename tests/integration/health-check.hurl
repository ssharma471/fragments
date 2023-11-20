# Health Check Test
GET http://localhost:8080

# We should get back an HTTP 1.1 404 response (or the appropriate status code for a not-found resource)
HTTP/1.1 404
# We should get back a non-cacheable response (cache-control header)
#Cache-Control: no-cache
