# Vending Machine API

This is a RESTful API for a vending machine that allows users with a “seller” role to add, update or remove products, while users with a “buyer” role can deposit coins into the machine and make purchases.

## Endpoints

```
/user
```

```
POST /user: Create a new user (does not require authentication)
GET /user: Get all users (requires seller authentication)
GET /user/:id: Get a specific user (requires seller authentication)
PUT /user/:id: Update a user (requires seller authentication)
DELETE /user/:id: Delete a user (requires seller authentication)
```

```
/product
```

```
POST /product: Add a new product (requires seller authentication)
GET /product: Get all products (does not require authentication)
GET /product/:id: Get a specific product (does not require authentication)
PUT /product/:id: Update a product (requires seller authentication)
DELETE /product/:id: Remove a product (requires seller authentication)
```

```
/deposit
```

```
POST /deposit: Deposit coins (requires buyer authentication)
/purchase
POST /purchase/:id: Purchase a product (requires buyer authentication)
```

```
/logout/all
POST /logout/all: Terminate all active sessions for a user (requires authentication)
```

# Models

## User

```
id: unique identifier for the user
username: username of the user
password: password of the user
deposit: amount of deposit in the user's vending machine account
role: role of the user (either "seller" or "buyer")
loggedIn: indicates whether the user is currently logged in (true or false)
```

## Product

```
id: unique identifier for the product
amountAvailable: amount of the product available in the vending machine
cost: cost of the product in cents
productName: name of the product
sellerId: identifier for the seller who created the product
```

## Authentication

The API uses basic authentication. Users must provide a username and password in the Authorization header of their requests.

## Bonus (done !)

If somebody is already logged in with the same credentials, the user is given a message "There is already an active session using your account". In this case the user can terminate all the active sessions on their account via the endpoint /logout/all.

## Installation

Install my-project with npm

```bash
npm install
npm run start
```

## Testing

To run tests on this project run

```bash
npm run test
```

## Tech Stack

**Server:** Node, Express, nodemone, jest
