import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";

let connection: Connection;
const url = "/api/v1";

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create an user", async () => {
    const response = await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });
    expect(response.status).toBe(201);
  });

  it("should not be able to create an user with registered email", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste1",
      email: "teste@email.com",
      password: "password1",
    });

    const response = await request(app).post(`${url}/users`).send({
      name: "Teste2",
      email: "teste@email.com",
      password: "password2",
    });
    expect(response.status).toBe(400);
  });
});
