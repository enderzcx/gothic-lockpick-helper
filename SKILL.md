---
name: gothic-lockpick-solver
description: Solve Gothic 1 Remake lockpicking puzzles from plate positions and right-move coupling tables.
user_invocable: true
---

# Gothic Lockpick Solver

Use this skill for Gothic 1 Remake lockpicking puzzles where each plate has positions 1-7 and the goal is usually all pins at slot 4.

## Workflow

1. Normalize the user's puzzle:
   - `initial`: one integer per plate.
   - `goal`: one integer per plate; default to all `4` if omitted.
   - `effects`: rows for each plate's right move.
2. Interpret each `P_i` right move as:
   - selected plate `i` changes by `+1`;
   - every other plate changes according to the row value `+1`, `0`, or `-1`;
   - left moves are the exact inverse.
3. Ender's game input direction is reversed from the solver convention. By default, swap every solver `R` and `L` before replying.
4. If the user explicitly asks for the raw mathematical solver direction, provide the unswapped solver sequence.
5. For fresh puzzles, save the puzzle as JSON and run the bundled solver:

```bash
node "$CLAUDE_SKILL_DIR/scripts/solve-lock.mjs" /path/to/puzzle.json
```

If `CLAUDE_SKILL_DIR` is unavailable, run from the repo root:

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

- Give the concise move sequence first.
- Include a compressed version when repetition is obvious.
- State the final verified state.
- Default to the `R/L` inverse of the solver output because Ender's in-game controls are reversed.

## Gotchas

- Users often provide 6 plates but only 5 entries per row. Ask for the missing column unless a safe assumption was explicitly requested.
- Some players describe visual pin movement rather than control direction. For Ender, use the full `R/L` inverse as the default in-game answer.
- Never claim the screenshot alone is enough; the coupling table is required.
