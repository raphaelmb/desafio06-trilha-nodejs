import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import auth from "../../../../config/auth";

let connection: Connection;
const url = "/api/v1";

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate user", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });

    auth.jwt.secret = "password";

    const response = await request(app).post(`${url}/sessions`).send({
      email: "teste@email.com",
      password: "password",
    });

    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate user with wrong password", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });

    auth.jwt.secret = "password";

    const response = await request(app).post(`${url}/sessions`).send({
      email: "teste@email.com",
      password: "wrogPass",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate nonexistent user", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });

    auth.jwt.secret = "password";

    const response = await request(app).post(`${url}/sessions`).send({
      email: "nonExistent@email.com",
      password: "wrogPass",
    });

    expect(response.status).toBe(401);
  });
});
