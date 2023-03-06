const request = require('supertest');

const { users,app ,products} = require('./app');

beforeEach(() => {
    users.push({ id: 1, username: 'seller1', password: 'password', deposit: 0, role: 'seller' });
    users.push({ id: 2, username: 'seller2', password: 'password', deposit: 0, role: 'seller' });
    users.push({ id: 3, username: 'seller3', password: 'password', deposit: 0, role: 'seller' });
    users.push({ id: 4, username: 'seller4', password: 'password', deposit: 0, role: 'seller' });

    users.push({ id: 5, username: 'buyer1', password: 'password', deposit: 5, role: 'buyer' });
    users.push({ id: 6, username: 'buyer2', password: 'password', deposit: 5, role: 'buyer' });
    users.push({ id: 7, username: 'buyer3', password: 'password', deposit: 0, role: 'buyer' });
    users.push({ id: 8, username: 'buyer4', password: 'password', deposit: 0, role: 'buyer' });

    products.push({ id: '1', amountAvailable: 2, cost: 2, productName: 'Product 1', sellerId: 1 });
    products.push({ id: '2', amountAvailable: 3, cost: 3, productName: 'Product 2', sellerId: 4 });
    products.push({ id: '3', amountAvailable: 0, cost: 2, productName: 'Product 3', sellerId: 3 });

});
describe('Authentication middleware', () => {


  it('should return 401 if no authorization header is present', async () => {
      const response = await request(app).post('/deposit');
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should return 401 if the user is not found', async () => {
    const response = await request(app)
      .post('/product')
      .set('Authorization', 'unknown')
      .send({ amountAvailable: 10, cost: 5, productName: 'Test Product' });
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should call next() if the user is found', async () => {
    const response = await request(app)
      .post('/product')
      .set('Authorization', 'seller1')
      .send({ amountAvailable: 10, cost: 5, productName: 'Test Product' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should return 409 if user already has an active session', async () => {
     const response = await request(app)
      .post('/product')
      .set('Authorization', 'seller1')
      .send({ amountAvailable: 10, cost: 5, productName: 'Test Product' });
     expect(response.status).toBe(409);
     expect(response.body.message).toBe('There is already an active session using your account');
  });

  it('should log out all active sessions of the user and return 200', async () => {
      const response = await request(app)
      .post('/logout/all')
      .set('Authorization', 'seller1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'All sessions terminated');
  });

});

describe('Routes', () => {
    afterEach(() => {
        users===[]
        products===[]
    });
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/user')
      .send({ username: 'newuser', password: 'password', deposit: 0, role: 'buyer' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('username', 'newuser');
  });

  it('should get all products', async () => {
    const response = await request(app).get('/product');
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('should get a specific product', async () => {
    const response = await request(app).get('/product/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('productName', 'Product 1');
  });

  it('should add a new product', async () => {
    const response = await request(app)
      .post('/product')
      .set('Authorization', 'seller2')
      .send({ amountAvailable: 10, cost: 5, productName: 'Test Product' });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('productName', 'Test Product');
    expect(response.body).toHaveProperty('id');
  });

  it('should update a product', async () => {
      const response = await request(app)
.put('/product/3')
.set('Authorization', 'seller3')
.send({ amountAvailable: 5, cost: 2, productName: 'Product 1 Updated' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('productName', 'Product 1 Updated');
  });

  it('should remove a product', async () => {
      const response = await request(app)
.delete('/product/2')
.set('Authorization', 'seller4');
      expect(response.status).toBe(204);
  });

  it('should deposit coins', async () => {
      const response = await request(app)
.post('/deposit')
.set('Authorization', 'buyer4')
.send({ deposit: 5 });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('deposit', 5);
  });

  it('should purchase a product', async () => {
      const response = await request(app)
.post('/purchase/2')
.set('Authorization', 'buyer2')
.send({ amount: 2 });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Purchase successful');
  });

  it('should return an error if the product is out of stock', async () => {
      const response = await request(app)
.post('/purchase/3')
.set('Authorization', 'buyer1')
.send({ amount: 2 });
      expect(response.status).toBe(200);
  });

  it('should return an error if the buyer does not have enough coins', async () => {
      const response = await request(app)
.post('/purchase/2')
.set('Authorization', 'buyer3')
.send({ amount: 3 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Insufficient funds');
  });
});




