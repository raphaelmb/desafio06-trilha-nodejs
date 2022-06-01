import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepositoryInMemory: InMemoryUsersRepository;
let statementsRepositoryInMemory: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation Test", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should get statement operation", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Name",
      email: "email@email.com",
      password: "password",
    });

    const statement = await statementsRepositoryInMemory.create({
      user_id: user.id as string,
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("should not get statement operation without valid user", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Name",
      email: "email@email.com",
      password: "password",
    });

    const statement = await statementsRepositoryInMemory.create({
      user_id: user.id as string,
      amount: 100,
      description: "test",
      type: OperationType.DEPOSIT,
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "",
        statement_id: statement.id as string,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not get statement operation without valid statement", async () => {
    const user = await usersRepositoryInMemory.create({
      name: "Name",
      email: "email@email.com",
      password: "password",
    });

    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
