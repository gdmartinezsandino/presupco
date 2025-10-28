# Postman Collection

This directory contains Postman collections and environments for testing the Presupco API.

## Quick Start

### Option 1: Direct Import (Recommended)
Click the button below to import the collection directly into Postman:

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/your-collection-id-here)

### Option 2: Manual Import
1. Open Postman
2. Import the following files:
   - `presupco-api.postman_collection.json`
   - `presupco-local.postman_environment.json`

## Environment Setup

1. After importing, select the "Presupco Local" environment from the environment dropdown
2. Update the following variables:
   - `baseUrl`: Your API base URL (default: http://localhost:3000)
   - `authToken`: After login, paste your JWT token here

## Collection Structure

The collection is organized by resource type:

- Auth
  - Register
  - Login
  - Logout
  - Reset Password
- Budgets
  - Create Budget
  - List Budgets
  - Update Budget
  - Delete Budget
- Categories
  - Create Category
  - List Categories
  - Update Category
  - Delete Category
- Expenses
  - Create Expense
  - List Expenses
  - Update Expense
  - Delete Expense
- Reports
  - Get Monthly Report
  - Get Annual Report

## Authentication

Most endpoints require authentication. After logging in:

1. Copy the JWT token from the login response
2. Update the `authToken` environment variable
3. All subsequent requests will automatically include the token

## Local Development

When running the API locally:
1. Make sure the API is running (`yarn start:dev` in the server directory)
2. Use the "Presupco Local" environment
3. The default `baseUrl` is set to http://localhost:3000

## Maintainers

Keep this collection up to date when:
- Adding new endpoints
- Modifying request/response schemas
- Changing authentication methods