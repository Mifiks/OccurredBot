import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'balance.json');

function load() {
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
}

let users = load();

function save() {
  fs.writeFileSync(dataPath, JSON.stringify(users, null, 2));
}

export function getBalance(id) {
  return users[id]?.balance ?? 0;
}

export function setBalance(id, amount) {
  if (!users[id]) users[id] = { balance: 0, lastWork: 0 };
  users[id].balance = amount;
  save();
}

export function getLastWork(id) {
  return users[id]?.lastWork ?? 0;
}

export function setLastWork(id, timestamp) {
  if (!users[id]) users[id] = { balance: 0, lastWork: 0 };
  users[id].lastWork = timestamp;
  save();
}

export function getAllUsers() {
  return users;
}
