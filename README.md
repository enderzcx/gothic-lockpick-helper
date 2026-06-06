# gothic开锁助手

中文说明在前。English: this repo contains a small deterministic solver for Gothic 1 Remake lockpicking puzzles.

一个给 Gothic 1 Remake 开锁小游戏用的解题助手。你记录每块板的初始位置和“右移某块板会带动哪些板”，脚本会把它当成有限状态搜索问题，算出一串合法操作。

## 什么时候用

游戏里的锁满足这几个条件：

- 每块板的位置是 `1-7`。
- 目标通常是所有 pin 到第 `4` 格。
- 移动一块板时，其他板可能同向 `+1`、不动 `0`、反向 `-1`。

截图本身不够，必须记录联动表。

## 输入格式

保存一个 JSON 文件：

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

`effects` 的第 N 行表示 `PN` 右移时，其他板如何变化。脚本会自动把被选中的那块板加 `+1`，所以本行对应自己的位置一般填 `0`。

## 运行

需要 Node.js 18+。

```bash
node scripts/solve-lock.mjs examples/puzzle-5plates.json
```

输出里：

- `moves` 是数学方向。
- Ender 当前游戏里的实际输入方向和数学方向相反，所以实操时默认把 `R/L` 全部互换。
- `final_state` 应该等于目标状态。

## 方向反转

如果脚本输出：

```text
P4R, P3L, P2R
```

Ender 实操默认用：

```text
P4L, P3R, P2L
```

## 安装成 Skill

可安装的 skill 包在：

```text
skill/gothic-lockpick-solver/
```

复制或软链接这个目录到你的 agent skills 目录即可。仓库根目录是 public README + CLI 示例，不是纯 skill 包。
