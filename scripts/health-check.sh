#!/bin/bash
echo "Health checks:"
curl -s http://localhost:8080/health | jq
