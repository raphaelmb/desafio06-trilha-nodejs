import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import auth from "../../../../config/auth";

let connection: Connection;
const url = "/api/v1";

describe("Create Statement Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should create a deposit statement", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });

    auth.jwt.secret = "password";

    const user = await request(app).post(`${url}/sessions`).send({
      email: "teste@email.com",
      password: "password",
    });

    const { token } = user.body;

    const deposit = await request(app)
      .post(`${url}/statements/deposit`)
      .send({
        user_id: user.body.id,
        amount: 100,
        description: "Deposit test",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(deposit.body).toHaveProperty("id");
    expect(deposit.body.amount).toBe(100);
    expect(deposit.status).toBe(201);
  });

  it("should create a withdraw statement", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });

    auth.jwt.secret = "password";

    const user = await request(app).post(`${url}/sessions`).send({
      email: "teste@email.com",
      password: "password",
    });

    const { token } = user.body;

    await request(app)
      .post(`${url}/statements/deposit`)
      .send({
        user_id: user.body.id,
        amount: 100,
        description: "Deposit test",
      })
      .set({ Authorization: `Bearer ${token}` });

    const deposit = await request(app)
      .post(`${url}/statements/withdraw`)
      .send({
        user_id: user.body.id,
        amount: 50,
        description: "Withdraw test",
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(deposit.body).toHaveProperty("id");
    expect(deposit.body.amount).toBe(50);
    expect(deposit.status).toBe(201);
  });
});
