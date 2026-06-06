# gothic开锁助手

中文说明在前。English: a small deterministic solver for Gothic 1 Remake lockpicking puzzles.

这个工具把 Gothic 1 Remake 的开锁小游戏当成一个状态搜索问题来解。你在游戏里记录每块板的初始位置和右移联动表，脚本会算出一串合法操作，把所有 pin 推到目标位置。

机制参考了 Mobalytics 的 Gothic 1 Remake lockpicking guide，链接在文末。那篇文章解释了锁的核心规则：每块板有 7 个位置，目标是让所有 pin 到第 4 格；移动一块板时，其他板可能一起动，所以要先记录联动关系再求解。

## 适用场景

适合：

- Gothic 1 Remake 的滑板式开锁谜题。
- 你能看到每块板的 pin 当前在第几格。
- 你愿意用 quicksave / reload 试出每块板右移时的联动效果。

不适合：

- 只有截图，没有联动表。
- 其他游戏的锁。
- 游戏规则和 1-7 格、目标第 4 格不一致的谜题。

## 一句话用法

1. 在游戏里记录 `initial` 和 `effects`。
2. 写成 JSON。
3. 运行脚本。
4. 如果你和 Ender 一样方向是反的，把输出里的 `R/L` 全部互换后再进游戏操作。

```bash
node scripts/solve-lock.mjs examples/puzzle-5plates.json
```

## 在游戏里怎么记录数据

先 quicksave。每次只测试一块板，记完就 reload，避免上一次测试污染下一次。

假设有 5 块板，记作 `P1` 到 `P5`。

1. 先看每块板 pin 在第几格，写成初始状态：

```text
initial: (6,1,1,6,1)
```

2. 测 `P1`：让 `P1` 右移一次，观察每块板的 pin 怎么变。

记录规则：

```text
+1 = 这块板也往右一格
 0 = 不动
-1 = 往左一格
```

如果 `P1` 右移时，`P2` 右移一格，`P4` 左移一格，其他不动，就写：

```text
P1 右移效果: (0,+1,0,-1,0)
```

注意：当前被操作的那块板，也就是这里的 `P1`，本行通常填 `0`。脚本会自动给被选中的板加 `+1`，不要在表里重复加。

3. reload 回到 quicksave，再测 `P2` 右移效果。
4. 重复到 `P5`。

最后你会得到一张表：

```text
P1 右移效果: (0,+1,0,-1,0)
P2 右移效果: (0,0,0,-1,-1)
P3 右移效果: (0,0,0,+1,-1)
P4 右移效果: (0,0,+1,0,0)
P5 右移效果: (0,+1,-1,0,0)
```

左移不用单独记录。脚本默认左移就是右移效果的反向。

## JSON 怎么填

把上面的数据写成 JSON：

```json
{
  "initial": [6, 1, 1, 6, 1],
  "goal": [4, 4, 4, 4, 4],
  "effects": [
    [0, 1, 0, -1, 0],
    [0, 0, 0, -1, -1],
    [0, 0, 0, 1, -1],
    [0, 0, 1, 0, 0],
    [0, 1, -1, 0, 0]
  ]
}
```

字段含义：

- `initial`：每块板当前 pin 的位置。
- `goal`：目标位置。通常全是 `4`。
- `effects`：第 N 行对应 `PN` 右移时的联动效果。

有 6 块板就写 6 个数、6 行 effects；有 7 块板就写 7 个数、7 行 effects。每一行长度必须和板数一致。

## 运行

需要 Node.js 18+。

```bash
node scripts/solve-lock.mjs examples/puzzle-5plates.json
```

输出大概长这样：

```json
{
  "solved": true,
  "moves": ["P4R", "P3L", "P2R"],
  "move_count": 3,
  "final_state": [4, 4, 4, 4, 4]
}
```

重要字段：

- `solved: true` 表示找到路线。
- `moves` 是脚本算出的数学方向。
- `move_count` 是步数。
- `final_state` 应该等于你的 `goal`。

如果 `solved: false`，通常是联动表记错了，或者某一行少了列。

## 方向反了怎么办

Mobalytics 那篇 guide 也提醒过：游戏里看到的左/右，可能和你给求解器描述的左/右相反。Ender 当前这份实测就是反的。

所以如果脚本输出：

```text
P4R, P3L, P2R
```

Ender 实操默认用：

```text
P4L, P3R, P2L
```

规则很简单：

```text
R -> L
L -> R
```

如果你用的是仓库里的 skill 包，它会默认先给 Ender 可直接在游戏里输入的反向版。

## 安装成 Skill

可安装的 skill 包在：

```text
skill/gothic-lockpick-solver/
```

把这个目录复制或软链接到支持 `SKILL.md` 的 agent skills 目录即可。仓库根目录是 public README 和 CLI 示例，不是纯 skill 包。

安装后，agent 收到这类输入时就能直接调用 solver：

```text
有 5 块板。
初始状态: (6,1,1,6,1)

P1 右移效果: (0,+1,0,-1,0)
P2 右移效果: (0,0,0,-1,-1)
P3 右移效果: (0,0,0,+1,-1)
P4 右移效果: (0,0,+1,0,0)
P5 右移效果: (0,+1,-1,0,0)

目标: (4,4,4,4,4)
```

## 来源 / Reference

- Mobalytics: [Gothic 1 Remake - How to Pick ANY Lock](https://mobalytics.gg/news/guides/gothic-1-remake-lockpicking-guide)

This repo uses the guide as the source for the lockpicking model: 7 positions per plate, target slot 4, right-move coupling effects, inverse left moves, and the possible need to invert left/right in actual play.
