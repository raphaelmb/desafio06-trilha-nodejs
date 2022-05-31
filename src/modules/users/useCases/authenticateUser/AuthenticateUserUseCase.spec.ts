import auth from "../../../../config/auth";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User Use Case Test", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
  });

  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "Name",
      email: "email@email.com",
      password: "password",
    };

    await createUserUseCase.execute(user);

    auth.jwt.secret = user.password;

    const authUser = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authUser).toHaveProperty("token");
  });

  it("should throw an error if user is not found", async () => {
    const user = await createUserUseCase.execute({
      name: "Name",
      email: "email@email.com",
      password: "password",
    });
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should throw an error if password does not match", async () => {
    const user = await createUserUseCase.execute({
      name: "Name",
      email: "email@email.com",
      password: "password",
    });
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "wrongPassword",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
