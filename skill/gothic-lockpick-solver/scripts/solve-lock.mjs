#!/usr/bin/env node
import fs from 'node:fs';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node solve-lock.mjs /path/to/puzzle.json');
  process.exit(2);
}

const puzzle = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const initial = puzzle.initial;
const goal = puzzle.goal ?? Array(initial.length).fill(4);
const effects = puzzle.effects;

if (!Array.isArray(initial) || !Array.isArray(goal) || !Array.isArray(effects)) {
  throw new Error('Expected JSON with initial, goal, and effects arrays.');
}

const n = initial.length;
if (goal.length !== n || effects.length !== n || effects.some((row) => row.length !== n)) {
  throw new Error(`Dimension mismatch: expected ${n} values for goal and every effects row.`);
}

const deltas = effects.map((row, index) => {
  const delta = row.slice();
  delta[index] += 1;
  return delta;
});

const key = (state) => state.join(',');
const legal = (state) => state.every((value) => value >= 1 && value <= 7);
const queue = [initial];
const previous = new Map([[key(initial), null]]);
const previousMove = new Map();
const goalKey = key(goal);

for (let head = 0; head < queue.length && !previous.has(goalKey); head += 1) {
  const state = queue[head];
  for (let plate = 0; plate < n; plate += 1) {
    for (const direction of [1, -1]) {
      const next = state.map((value, index) => value + direction * deltas[plate][index]);
      const nextKey = key(next);
      if (!legal(next) || previous.has(nextKey)) continue;
      previous.set(nextKey, key(state));
      previousMove.set(nextKey, `P${plate + 1}${direction === 1 ? 'R' : 'L'}`);
      queue.push(next);
    }
  }
}

if (!previous.has(goalKey)) {
  console.log(JSON.stringify({ solved: false, explored: queue.length }, null, 2));
  process.exit(1);
}

const moves = [];
for (let cursor = goalKey; previous.get(cursor) !== null; cursor = previous.get(cursor)) {
  moves.push(previousMove.get(cursor));
}
moves.reverse();

let state = initial.slice();
const trace = [{ move: 'start', state }];
for (const move of moves) {
  const plate = Number(move.match(/^P(\d+)[RL]$/)[1]) - 1;
  const direction = move.endsWith('R') ? 1 : -1;
  state = state.map((value, index) => value + direction * deltas[plate][index]);
  trace.push({ move, state });
}

console.log(JSON.stringify({
  solved: true,
  moves,
  move_count: moves.length,
  final_state: state,
  trace
}, null, 2));
