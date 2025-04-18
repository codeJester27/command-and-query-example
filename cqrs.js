import express from "express";
import { CommandModel, DataStore, QueryModel } from "./shared.js";

const queryDataStore = new DataStore();
const commandDataStore = new DataStore();
const queryModel = new QueryModel(queryDataStore);
const commandModel = new CommandModel(commandDataStore);
commandModel.synchronizedDataStores = [queryDataStore];

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static("pages"));

app.get("/users", async (req, res) => {
  const data = await queryModel.getUsers();

  res.writeHead(200).end(JSON.stringify(data));
});

app.post("/user", async (req, res) => {
  const { name, role } = req.body;
  if (typeof name === "string" && typeof role === "string") {
    await commandModel.createUser(name, role);
    res.writeHead(200).end();
  } else {
    res.writeHead(400).end();
  }
});

app.put("/user/:id", async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;
  if (id && typeof name === "string" && typeof role === "string") {
    await commandModel.updateUser(id, name, role);
    res.writeHead(200).end();
  } else {
    res.writeHead(400).end();
  }
});

app.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  if (id) {
    res
      .writeHead(200)
      .end(JSON.stringify(((await queryModel.getUser(id)) ?? [])[0]));
  } else {
    res.writeHead(400).end();
  }
});

const PORT = 3000;
app.listen(PORT);
console.log(`Listening on port ${PORT}`);
