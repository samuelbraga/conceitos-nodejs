const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username == username);
  request.user = user;

  if(!user) {
    return response.status(404).json({ error: "User not found" });
  }

  return next();
}

function getTodo(request, response, next) {
  const id = request.params.id;
  const user = request.user;
  
  const todo = user.todos.find((todo) => todo.id == id);
  request.todo = todo;

  if(!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const existUsername = users.find((user) => user.username == username);

  if(existUsername) {
    return response.status(400).json({ error: "User already exists" });
  }

  const id = uuidv4();
  const todos = [];
  const user = {
    id,
    name,
    username,
    todos
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(200).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const user = request.user;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, getTodo, (request, response) => {
  const { title, deadline } = request.body;
  const todo = request.todo;
  
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, getTodo, (request, response) => {
  const todo = request.todo;
  todo.done = true;
  return response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, getTodo, (request, response) => {
  const user = request.user;
  const todo = request.todo;

  user.todos.pop(todo);
  return response.status(204).send();
});

module.exports = app;