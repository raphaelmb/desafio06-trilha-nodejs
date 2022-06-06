import { Connection } from "typeorm";
import createConnection from "../../../../database";
import request from "supertest";
import { app } from "../../../../app";
import auth from "../../../../config/auth";

let connection: Connection;
const url = "/api/v1";

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show user profile", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });

    auth.jwt.secret = "password";

    const userAuth = await request(app).post(`${url}/sessions`).send({
      email: "teste@email.com",
      password: "password",
    });

    const { token } = userAuth.body;

    const response = await request(app)
      .get(`${url}/profile`)
      .send({
        user_id: userAuth.body.id,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body).toHaveProperty("id");
  });

  it("should not be able to show user profile without token", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });

    auth.jwt.secret = "password";

    const userAuth = await request(app).post(`${url}/sessions`).send({
      email: "teste@email.com",
      password: "password",
    });

    const response = await request(app).get(`${url}/profile`).send({
      user_id: userAuth.body.id,
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to show user profile with invalid token", async () => {
    await request(app).post(`${url}/users`).send({
      name: "Teste",
      email: "teste@email.com",
      password: "password",
    });

    auth.jwt.secret = "password";

    const userAuth = await request(app).post(`${url}/sessions`).send({
      email: "teste@email.com",
      password: "password",
    });

    const response = await request(app)
      .get(`${url}/profile`)
      .send({
        user_id: userAuth.body.id,
      })
      .set({
        Authorization: `Bearer invalidToken`,
      });

    expect(response.status).toBe(401);
  });
});
