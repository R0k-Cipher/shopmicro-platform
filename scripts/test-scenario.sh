#!/bin/bash
echo "Running basic test scenario..."
curl -s -X POST http://localhost:8080/api/users/register -H "Content-Type: application/json" -d '{"email":"test@example.com","name":"Test User"}' | jq
curl -s http://localhost:8080/api/products | jq '.'
