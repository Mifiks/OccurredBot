import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'events.json');

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

export function getEventPoints(id) {
  return users[id]?.points ?? 0;
}

export function addEventPoints(id, amount) {
  if (!users[id]) users[id] = { points: 0 };
  users[id].points += amount;
  save();
}

export function setEventPoints(id, amount) {
  if (!users[id]) users[id] = { points: 0 };
  users[id].points = amount;
  save();
}

export function getAllEventUsers() {
  return users;
}
