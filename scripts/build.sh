#!/bin/bash

# Build frontend
cd frontend
npm ci
npm run build

# Build python package
cd -
uv build