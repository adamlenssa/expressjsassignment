import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";
const app = express();
app.use(express.json());
// All code should go below this line
app.get("/", (req, res) => {
  res.status(200).send({ message: "Hello World!" });
});
app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();
  res.status(200).send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    res
      .status(400)
      .send({ message: "id should be a number" });
    return;
  }
  const dog = await prisma.dog.findFirst({
    where: { id },
  });
  if (!dog) {
    res.sendStatus(204);
    return;
  }
  res.send(dog).sendStatus(200);
});

app.patch("/dogs/:id", async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  const body = req.body;
  const validKeys: string[] = [
    "name",
    "age",
    "description",
    "breed",
  ];
  const errors: string[] = [];
  for (const [key] of Object.entries(body)) {
    if (!validKeys.includes(key)) {
      errors.push(`'${key}' is not a valid key`);
    }
  }
  if (errors.length > 0) {
    return res.status(404).send({ errors });
  }
  const updatedDog = await Promise.resolve()
    .then(() =>
      prisma.dog.update({
        where: { id: numId },
        data: { ...body },
      })
    )
    .catch(() => null);
  if (!updatedDog) {
    return res.status(404);
  }
  return res.status(201).send(updatedDog);
});

app.post("/dogs", async (req, res) => {
  const validKeys = ["name", "age", "description", "breed"];
  const errors: string[] = [];
  const { name, description, breed, age } = req.body;
  const numAge = +age;
  for (const [key] of Object.entries(req.body)) {
    if (!validKeys.includes(key)) {
      errors.push(`'${key}' is not a valid key`);
      continue;
    }
  }
  if (typeof name !== "string") {
    errors.push("name should be a string");
  }
  if (!age || isNaN(numAge)) {
    errors.push("age should be a number");
  }
  if (typeof breed !== "string") {
    errors.push("breed should be a string");
  }
  if (typeof description !== "string") {
    errors.push("description should be a string");
  }
  if (errors.length > 0) {
    return res.status(400).send({ errors });
  }
  const newDog = await prisma.dog
    .create({
      data: { name, age: numAge, breed, description },
    })
    .catch(() => null);
  if (!newDog) {
    res.status(400).send({ error: "Something Broke" });
  }
  res.status(201).send(newDog);
});

app.delete("/dogs/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    res
      .status(400)
      .send({ message: "id should be a number" });
    return;
  }
  const deletedDog = await Promise.resolve()
    .then(() =>
      prisma.dog.delete({
        where: { id },
      })
    )
    .catch(() => null);
  if (!deletedDog) {
    return res.status(204).send({ messge: "no dog here" });
  }
  res.status(200).send(deletedDog);
});
// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
