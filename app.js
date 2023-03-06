const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Models
const products = [];
const users = [];

// Create a logoutAll function that logs out all active sessions of the user

   const logoutAll = () => {
       users.forEach((u) => {
           if (u.username === user.username) {
               u.loggedIn = false;
           }
       });
   };
// Authentication middleware
const authenticate = (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Perform your authentication logic here, for example check if the user exists in the users array
    const user = users.find((user) => user.username === authorization);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if the user is already logged in
    const activeSession = users.find((u) => u.loggedIn && u.username === user.username);
    if (activeSession) {
        return res.status(409).json({ message: 'There is already an active session using your account' });
    }

    // Update the user's loggedIn property
    user.loggedIn = true;

    req.user = user;



    // Add the logoutAll function to the response object
    res.logoutAll = logoutAll;

    next();
};
// Routes

// Register a new user (does not require authentication)
app.post('/user', (req, res) => {
  const { username, password, deposit, role } = req.body;
  const user = { username, password, deposit, role };
  users.push(user);
  res.status(201).json(user);
});

// Get all products (does not require authentication)
app.get('/product', (req, res) => {
  res.json(products);
});

// Get a specific product (does not require authentication)
app.get('/product/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

// Add a new product (requires seller authentication)
app.post('/product', authenticate, (req, res) => {
  const { amountAvailable, cost, productName } = req.body;
  const sellerId = req.user.id;
  const product = { id: products.length + 1, amountAvailable, cost, productName, sellerId };
  products.push(product);
  res.status(201).json(product);
});

// Update a product (requires seller authentication)
app.put('/product/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { amountAvailable, cost, productName } = req.body;
  const sellerId = req.user.id;
  const index = products.findIndex((p) => p.id === id && p.sellerId === sellerId);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products[index] = { id, amountAvailable, cost, productName, sellerId };
  res.json(products[index]);
});

// Remove a product (requires seller authentication)
app.delete('/product/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const sellerId = req.user.id;
  const index = products.findIndex((p) => p.id === id && p.sellerId === sellerId);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products.splice(index, 1);
  res.status(204).end();
});

// Deposit coins (requires buyer authentication)
app.post('/deposit', authenticate, (req, res) => {
  const { deposit } = req.body;
  const validCoins = [5, 10, 20, 50, 100];
  if (!validCoins.includes(deposit)) {
      return res.status(400).json({ message: 'Invalid coin amount. Valid coins are: 5, 10, 20, 50, 100' });
  }
    const buyerId = req.user.id;
  const index = users.findIndex((u) => u.id === buyerId);
  if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
  }
    users[index].deposit += deposit;
  res.json(users[index]);
});

// Purchase a product (requires buyer authentication)
app.post('/purchase/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const buyerId = req.user.id;
    const index = users.findIndex((u) => u.id === buyerId);
    if (index === -1) {
        return res.status(404).json({ message: 'User not found' });
    }
    const buyer = users[index];
    const productIndex = products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
    }
    const product = products[productIndex];
    if (product.amountAvailable < 1) {
        return res.status(400).json({ message: 'Product is out of stock' });
    }
    if (buyer.deposit < product.cost) {
        return res.status(400).json({ message: 'Insufficient funds' });
    }
    buyer.deposit -= product.cost;
    product.amountAvailable -= 1;
    res.status(200).json({ message: 'Purchase successful' });
});

app.post('/logout/all',  (req, res) => {
    res.status(200).json({ message: 'All sessions terminated' });
    res.logoutAll();
});


app.listen(port, () => {
    console.log(`running on http://localhost:${port}`);
});
module.exports = {
    app,
    users,
    products
};
