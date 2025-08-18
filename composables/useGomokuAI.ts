
const AI = (map: number[][], depth: number, my: number, x: number, y: number, arg: { random: number; pur: number; rank: string }) => {
  return init(map, depth, my, x, y, arg)
}
let count = 0
let depth: number
let arg: { random: number; pur: number; rank: string }

const init = (map: number[][], _depth: number, my: number, x: number, y: number, _arg: { random: number; pur: number; rank: string }) => {
  depth = _depth
  arg = _arg
  const initTime = new Date().getTime()
  const results = getAlphaBeta(-999999, 999999, depth, map, my, x, y)
  const runTime = new Date().getTime() - initTime
  console.log(`等级：${arg.rank}\n搜索分支：${count}个\n最佳着法：X${results.x} Y${results.y}\n最佳着法评估：${results.value}分\n搜索用时：${runTime}毫秒`)
  return { x: results.x, y: results.y }
}

const getAlphaBeta = (A: number, B: number, _depth: number, map: number[][], my: number, x: number, y: number): { x: number; y: number; value: number } => {
  if (_depth === 0) {
    count++
    return { value: evaluate(map, my, x, y), x, y }
  }
  const moves = getMoves(map, x, y)
  let rootKey: { x: number; y: number; value: number } | null = null
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i]
    const my_y = move.y
    const my_x = move.x
    map[my_y][my_x] = my
    const val = -getAlphaBeta(-B, -A, _depth - 1, map, -my, my_x, my_y).value
    map[my_y][my_x] = 0
    if (val >= B) {
      return { x: my_x, y: my_y, value: B }
    }
    if (val > A) {
      A = val
      if (depth === _depth)
        rootKey = { x: my_x, y: my_y, value: A }
    }
  }
  if (depth === _depth) {
    if (!rootKey) {
      return { x, y, value: 0 }
    }
    else {
      return rootKey
    }
  }
  return { x, y, value: A }
}

const getMoves = (map: number[][], x: number, y: number) => {
  const pur = arg.pur
  const moves: { x: number; y: number }[] = []
  let minX = x - pur
  if (minX < 0)
    minX = 0

  let maxX = x + pur
  if (maxX > 14)
    maxX = 14

  let minY = y - pur
  if (minY < 0)
    minY = 0

  let maxY = y + pur
  if (maxY > 14)
    maxY = 14

  for (let i = minY; i <= maxY; i++) {
    for (let n = minX; n <= maxX; n++) {
      const m = map[i][n]
      if (m === 0) {
        moves.push({ x: n, y: i })
      }
    }
  }
  return moves
}

const evaluate = (map: number[][], my: number, x: number, y: number) => {
  let val = getValue(map, my, x, y)
  val += getValue(map, -my, x, y)
  return val * -my
}

const getValue = (map: number[][], my: number, x: number, y: number) => {
  let val = Math.floor(Math.random() * arg.random)
  const pur = arg.pur
  const len = 15

  const value: { [key: number]: number } = {
    11: 1,
    12: 2,
    21: 10,
    22: 20,
    31: 30,
    32: 50,
    41: 60,
    42: 100,
    50: 88888,
    51: 88888,
    52: 88888,
  }

  const A: { n: number; v: number } = { n: 1, v: 0 }

  const dis = (x: number, y: number, my: number) => {
    if (x < 0 || x > 14 || y < 0 || y > 14) {
      return false
    }
    const m = map[y][x]
    if (m === my) {
      A.n++
      return true
    }
    else {
      if (m === 0)
        A.v++
      return false
    }
  }

  A.n = 1
  A.v = 0
  for (let i = 1; i <= len; i++) {
    const _x = x - i
    if (!dis(_x, y, my))
      break
  }
  for (let i = 1; i < len; i++) {
    const _x = x + i
    if (!dis(_x, y, my))
      break
  }
  if (A.n > 5)
    A.n = 5
  val += value[A.n * 10 + A.v] || 0

  A.n = 1
  A.v = 0
  for (let i = 1; i < len; i++) {
    const _y = y - i
    if (!dis(x, _y, my))
      break
  }
  for (let i = 1; i < len; i++) {
    const _y = y + i
    if (!dis(x, _y, my))
      break
  }
  if (A.n > 5)
    A.n = 5
  val += value[A.n * 10 + A.v] || 0

  A.n = 1
  A.v = 0
  for (let i = 1; i < len; i++) {
    const _x = x - i
    const _y = y - i
    if (!dis(_x, _y, my))
      break
  }
  for (let i = 1; i < len; i++) {
    const _x = x + i
    const _y = y + i
    if (!dis(_x, _y, my))
      break
  }
  if (A.n > 5)
    A.n = 5
  val += value[A.n * 10 + A.v] || 0

  A.n = 1
  A.v = 0
  for (let i = 1; i < len; i++) {
    const _x = x + i
    const _y = y - i
    if (!dis(_x, _y, my))
      break
  }
  for (let i = 1; i < len; i++) {
    const _x = x - i
    const _y = y + i
    if (!dis(_x, _y, my))
      break
  }
  if (A.n > 5)
    A.n = 5
  val += value[A.n * 10 + A.v] || 0

  return val
}

export const useGomokuAI = () => {
  return {
    AI,
  }
}
