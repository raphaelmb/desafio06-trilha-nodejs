import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User Use Case Test", () => {
  beforeEach(() => {
    userRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
  });

  it("should create a new user", async () => {
    const user = await createUserUseCase.execute({
      name: "Name",
      email: "email@email.com",
      password: "password",
    });
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("password");
  });

  it("should not create a new user", async () => {
    await createUserUseCase.execute({
      name: "Name",
      email: "email@email.com",
      password: "password",
    });
    expect(async () => {
      await createUserUseCase.execute({
        name: "Name",
        email: "email@email.com",
        password: "password",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
