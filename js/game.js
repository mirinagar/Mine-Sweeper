'use strict'


const MINE = '💥'
const EMPTY = ' '
const FLAG = '🚩'
const NORMAL = '😀'
const LOSE = '🤯'
const WIN = '😎'


var gGame
var gBoard
var gLevel
var gIntervalTimeId
var isGameOver
var gMineCounter

gLevel = {
    SIZE: 4,
    MINES: 2
}

function onInit() {
    gMineCounter = 0
    gBoard = buildBoard()
    console.log(gBoard)
    isGameOver = false


    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    renderScore()
}

function setLevel(size) {

    var mines = 0
    if (size === 4) mines = 2
    if (size === 8) mines = 14
    if (size === 12) mines = 32
    gLevel = {
        SIZE: size,
        MINES: mines
    }

    onInit()
}

function renderScore() {

    var elScore = document.querySelector('.score')

    var elButton = elScore.querySelector('button')
    elButton.innerText = NORMAL

    var elFlags = document.querySelector('.flags')
    elFlags.innerText = '0' + gLevel.MINES

    var elTime = document.querySelector('.time')
    elTime.innerText = '000'


}

function updateTimer() {
    gGame.secsPassed++
    console.log(gGame.secsPassed)
    var elTime = document.querySelector('.time')
    var time = gGame.secsPassed
    elTime.innerText = time

}

function updateFlags() {
    var elFlags = document.querySelector('.flags')
    elFlags.innerText = gLevel.MINES - gMineCounter

}

function buildBoard() {
    const size = gLevel.SIZE
    const board = createMat(size)

    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = {
                type: EMPTY,
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            }

        }
    }
    // board[1][0].type = MINE
    // board[2][2].type = MINE
    renderBoard(board)
    return board
}

function randomMines(board, i, j) {
    gBoard[i][j].isRevealed = true
    for (var i = 0; i < gLevel.MINES; i++) {
        var pos = findEmptyPos(gBoard)
        console.log('pos', pos)
        board[pos.i][pos.j].type = MINE
        board[pos.i][pos.j].isMine = true
    }
}

function findEmptyPos(board) {
    var emptyPoss = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (gBoard[i][j].isRevealed === false) {
                var pos = { i, j }
                emptyPoss.push(pos)
            }
        }
    }
    var randIdx = getRandomInt(0, emptyPoss.length)
    console.log('emptyPoss[randIdx]', emptyPoss[randIdx])
    return emptyPoss[randIdx]
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j].type !== MINE) {
                board[i][j].minesAroundCount = countNegs(i, j)
            }
        }
    }
}


function countNegs(cellI, cellJ) {
    var mineCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === cellI && j === cellJ) continue
            if (gBoard[i][j].type === MINE) mineCount++
        }
    }

    return mineCount
}


function onCellClicked(elCell, i, j) {
    if (isGameOver) return

    if (!gGame.isOn) {
        randomMines(gBoard, i, j)
        setMinesNegsCount(gBoard)
        gGame.isOn = true
        gGame.revealedCount++
        gIntervalTimeId = setInterval(updateTimer, 1000)
    }
    const cell = gBoard[i][j]
    elCell.style.backgroundColor = "white"
    if (!gBoard[i][j].isRevealed) {
        gGame.revealedCount++
        gBoard[i][j].isRevealed = true
    }

    if (cell.minesAroundCount) {
        elCell.innerHTML = cell.minesAroundCount
        renderNumberColor(elCell, cell)

    }

    else if (cell.type === MINE) {
        elCell.innerHTML = MINE

        gameOverLoser(cell)
    }

    else if (cell.type === EMPTY) {

        elCell.innerHTML = EMPTY
        expandReveal(i, j)
    }
    checkGameOver()
    console.log('CLICK')

}


function expandReveal(cellI, cellJ) {

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === cellI && j === cellJ) continue
            const cell = gBoard[i][j]

            var location = { i, j }
            const elCell = document.querySelector(`.cell-${location.i}-${location.j}`)

            if (cell.type === MINE) continue
            if (cell.isMarked) continue

            if (!gBoard[i][j].isRevealed) {
                gGame.revealedCount++
                gBoard[i][j].isRevealed = true
                elCell.style.backgroundColor = "white"

                if (cell.minesAroundCount) {
                    renderCell(location, cell.minesAroundCount)
                    renderNumberColor(elCell, cell)
                }

                else if (cell.type === EMPTY) {
                    renderCell(location, EMPTY)
                    expandReveal(i, j)
                }
            }
        }
    }
}


function renderNumberColor(elCell, cell) {
    if (cell.minesAroundCount === 1) elCell.style.color = "blue"
    if (cell.minesAroundCount === 2) elCell.style.color = "brown"
    if (cell.minesAroundCount === 3) elCell.style.color = "green"
    if (cell.minesAroundCount === 4) elCell.style.color = "orange"
    if (cell.minesAroundCount === 5) elCell.style.color = "red"
    if (cell.minesAroundCount === 6) elCell.style.color = "black"
}


function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    if (isGameOver) return
    if (!gBoard[i][j].isRevealed) {

        if (!gBoard[i][j].isMarked) {
            elCell.innerHTML = FLAG
            gBoard[i][j].isMarked = true
            gMineCounter++
            updateFlags()
            if (gBoard[i][j].isMine) gGame.markedCount++

        } else {
            elCell.innerHTML = EMPTY
            gBoard[i][j].isMarked = false
            gMineCounter--
            updateFlags()
            if (gBoard[i][j].isMine) gGame.markedCount--

        }
    }
    console.log('gMineCounter', gMineCounter)
    console.log('gGame.markedCount', gGame.markedCount)
    console.log('FLAG')
}


function checkGameOver() {
    const revealed = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.revealedCount === revealed && gGame.markedCount === gLevel.MINES) gameOverWinner()
}

function gameOverWinner() {
    console.log('gameOverWinner')
    isGameOver = true
    gGame.isOn = false
    clearInterval(gIntervalTimeId)
    
    var elButton = document.querySelector('.score button')
    elButton.innerText = WIN

}

function gameOverLoser(cell) {
    console.log('gameOverLoser')
    isGameOver = true
    gGame.isOn = false
    clearInterval(gIntervalTimeId)

    var elButton = document.querySelector('.score button')
    elButton.innerText = LOSE


    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            if (gBoard[i][j].type === MINE) {
                elCell.innerHTML = MINE
                elCell.style.backgroundColor = "white"
            }
            if (gBoard[i][j] === cell) elCell.style.backgroundColor = "red"
        }
    }
}


function restart() {
    onInit()
}