@echo off
echo Running basic test scenario...
powershell -Command "Invoke-RestMethod -Uri http://localhost:8080/api/users/register -Method POST -Body '{\"email\":\"test@example.com\",\"name\":\"Test User\"}' -ContentType 'application/json'"
curl http://localhost:8080/api/products
