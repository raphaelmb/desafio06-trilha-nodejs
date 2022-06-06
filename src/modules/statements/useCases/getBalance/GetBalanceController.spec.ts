import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import auth from "../../../../config/auth";

let connection: Connection;
const url = "/api/v1";

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance", async () => {
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

    const response = await request(app)
      .get(`${url}/statements/balance`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("statement");
    expect(response.body).toHaveProperty("balance");
    expect(response.status).toBe(200);
  });
});
