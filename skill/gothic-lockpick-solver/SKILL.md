---
name: gothic-lockpick-solver
description: Solve Gothic 1 Remake lockpicking puzzles with a deterministic solver. Use when the user asks for Gothic lockpicking help, provides initial plate positions plus P1/P2/P3 right-move effects, or says a computed Gothic lock sequence is reversed. Not for ordinary game advice, screenshot-only lock solving without the coupling table, non-Gothic locks, or unrelated puzzle games.
user_invocable: true
---

# Gothic Lockpick Solver

Use this skill for Gothic 1 Remake lockpicking puzzles where each plate has positions 1-7 and the goal is usually all pins at slot 4.

Class: `wrapper`. It wraps a deterministic BFS solver script and adds the game-specific direction convention.

## Workflow

1. Normalize the user's puzzle:
   - `initial`: one integer per plate.
   - `goal`: one integer per plate; default to all `4` if omitted.
   - `effects`: rows for each plate's right move.
2. Check dimensions before solving:
   - `initial.length === goal.length`.
   - `effects.length === initial.length`.
   - every effect row has one value per plate.
3. Interpret each `P_i` right move as:
   - selected plate `i` changes by `+1`;
   - every other plate changes according to the row value `+1`, `0`, or `-1`;
   - left moves are the exact inverse.
4. Ender's game input direction is reversed from the solver convention. By default, swap every solver `R` and `L` before replying.
5. If the user explicitly asks for the raw mathematical solver direction, provide the unswapped solver sequence.
6. For fresh puzzles, save the puzzle as JSON and run the bundled solver:

```bash
node "$CLAUDE_SKILL_DIR/scripts/solve-lock.mjs" /path/to/puzzle.json
```

If `CLAUDE_SKILL_DIR` is unavailable, run from this skill directory:

```bash
node scripts/solve-lock.mjs /path/to/puzzle.json
```

Input JSON shape:

```json
{
  "initial": [4, 7, 7, 4, 7, 3],
  "goal": [4, 4, 4, 4, 4, 4],
  "effects": [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, -1, 0],
    [0, 0, 0, 0, 0, 0],
    [1, -1, 0, -1, 0, -1],
    [0, 1, 0, 1, 0, 0]
  ]
}
```

## Response Pattern

- Give the in-game move sequence first, already using Ender's default `R/L` inverse.
- Include a compressed version when repetition is obvious.
- State the final verified state.
- Mention raw solver direction only if useful for debugging.

## Skip Cases

- Screenshot-only requests: explain that the coupling table is required.
- Missing row/column values: ask for the missing values unless the user explicitly asks for a safe assumption.
- Non-Gothic puzzles: do not force this model onto a different lock system.
- User reports an impossible route after using the inverse: ask them to re-check the coupling table instead of guessing.

## References

- Mobalytics Gothic 1 Remake lockpicking guide: https://mobalytics.gg/news/guides/gothic-1-remake-lockpicking-guide
