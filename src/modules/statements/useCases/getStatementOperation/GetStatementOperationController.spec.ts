import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import auth from "../../../../config/auth";

let connection: Connection;
const url = "/api/v1";

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement operation", async () => {
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

    const statement = await request(app)
      .post(`${url}/statements/deposit`)
      .send({
        user_id: user.body.id,
        amount: 100,
        description: "Deposit test",
      })
      .set({ Authorization: `Bearer ${token}` });

    const operation = await request(app)
      .get(`${url}/statements/${statement.body.id}`)
      .set({ Authorization: `Bearer ${token}` });

    expect(operation.body).toHaveProperty("id");
  });
});
