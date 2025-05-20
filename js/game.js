'use strict'


const MINE = '💥'
const EMPTY = ' '
const FLAG = '🚩'
const NORMAL = '😀'
const LOSE = '🤯'
const WIN = '😎'
const HINT = '💡'

var gGame
var gBoard
var gLevel
var gIntervalTimeId
var isGameOver
var gMineCounter
var gLivesCounter = 1
var isHint = false
var gHitNum

gLevel = {
    SIZE: 4,
    MINES: 2
}

function onInit() {
    renderScoreBoards()

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

}

function setLevel(size) {

    var mines = 0
    if (size === 4) {
        mines = 2
        gLivesCounter = 1
    }
    if (size === 8) {
        mines = 14
        gLivesCounter = 2
    }
    if (size === 12) {
        mines = 32
        gLivesCounter = 3
    }
    gLevel = {
        SIZE: size,
        MINES: mines
    }

    onInit()
    return
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

function renderScoreBoards() {

    var elScore = document.querySelector('.score')

    var elButton = elScore.querySelector('button')
    elButton.innerText = NORMAL

    var elFlags = document.querySelector('.flags')
    elFlags.innerText = '0' + gLevel.MINES

    var elTime = document.querySelector('.time')
    elTime.innerText = '000'

    var elLives = document.querySelector('.lives')
    elLives.innerText = gLivesCounter + ' LIVES LEFT'

    var elHint1 = document.querySelector('.hint1')
    elHint1.innerText = HINT
    elHint1.style.display = "block"
    elHint1.style.backgroundColor = ""


    var elHint2 = document.querySelector('.hint2')
    elHint2.innerText = HINT
    elHint1.style.display = "block"
    elHint2.style.backgroundColor = ""

    var elHint3 = document.querySelector('.hint3')
    elHint3.innerText = HINT
    elHint1.style.display = "block"
    elHint3.style.backgroundColor = ""

}


function randomMines(board, i, j) {
    gBoard[i][j].isRevealed = true
    const emptyPoss = findEmptyPos(gBoard)

    for (var i = 0; i < gLevel.MINES; i++) {
        const randIdx = getRandomInt(0, emptyPoss.length)
        const pos = emptyPoss[randIdx]

        board[pos.i][pos.j].type = MINE
        board[pos.i][pos.j].isMine = true
        emptyPoss.splice(randIdx, 1)
    }
}


function findEmptyPos(board) {
    const emptyPoss = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (gBoard[i][j].isRevealed === false) {
                var pos = { i, j }
                emptyPoss.push(pos)
            }
        }
    }

    return emptyPoss
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
    if (gBoard[i][j].isMarked) return
    checkGameOver()
    if (!gGame.isOn) {
        randomMines(gBoard, i, j)
        setMinesNegsCount(gBoard)
        gGame.isOn = true
        gGame.revealedCount++
        gIntervalTimeId = setInterval(updateTimer, 1000)
    }


    if (isHint) {
        revealHint(elCell, i, j)
        return
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
        checkGameOver()
    }

    else if (cell.type === MINE) {
        if (gLivesCounter > 1) {

            useLive(elCell, i, j)
        } else {
            elCell.innerHTML = MINE
            gameOverLoser(cell)
        }

    }
    else if (cell.type === EMPTY) {

        elCell.innerHTML = EMPTY
        expandReveal(i, j)
        checkGameOver()
    }

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
            gBoard[i][j].isMarked = true
            elCell.innerHTML = FLAG
            gMineCounter++
            updateFlags()
            if (gBoard[i][j].isMine) gGame.markedCount++
            checkGameOver()

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

}

function checkGameOver() {
    const revealed = gLevel.SIZE ** 2 - gLevel.MINES
    console.log('gGame.markedCount', gGame.markedCount)
    if (gGame.revealedCount === revealed) gameOverWinner()

    //&& gGame.markedCount === gLevel.MINES
}

function gameOverWinner() {
    clearInterval(gIntervalTimeId)
    console.log('gameOverWinner')
    isGameOver = true
    gGame.isOn = false


    var elButton = document.querySelector('.score button')
    elButton.innerText = WIN

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            const elCell = document.querySelector(`.cell-${i}-${j}`)
            if (gBoard[i][j].isMine) {
                elCell.innerHTML = FLAG
            }
        }
    }

    var elFlags = document.querySelector('.flags')
    elFlags.innerText = '00'
    var elLives = document.querySelector('.lives')
    elLives.innerText = 'YOU WON!'
}


function gameOverLoser(cell) {
    console.log('gameOverLoser')
    isGameOver = true
    gGame.isOn = false
    clearInterval(gIntervalTimeId)

    var elLives = document.querySelector('.lives')
    elLives.innerText = 'GAME OVER'

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
    setLevel(gLevel.SIZE)
}



function updateTimer() {
    if (!gGame.isOn) return
    gGame.secsPassed++

    var elTime = document.querySelector('.time')
    var time = gGame.secsPassed
    elTime.innerText = time

}

function updateFlags() {
    var elFlags = document.querySelector('.flags')
    elFlags.innerText = gLevel.MINES - gMineCounter

}

function useLive(elCell, i, j) {
    gLivesCounter--
    gGame.revealedCount--
    gBoard[i][j].isRevealed = false


    var elLives = document.querySelector('.lives')
    elLives.innerText = gLivesCounter + ' LIVES LEFT'

    elCell.innerHTML = MINE
    elCell.style.backgroundColor = "yellow"

    setTimeout(() => {
        elCell.innerHTML = EMPTY
        elCell.style.backgroundColor = "#c4c1c1"
    }, "1000")

}


function useHint(elHint, hintNumber) {
    if (isHint) return

    isHint = true
    elHint.style.backgroundColor = "yellow"
    console.log('elHint', elHint)
    gHitNum = hintNumber


}

function revealHint(elCell, cellI, cellJ) {
    console.log('HINT')
    const className = '.' + 'hint' + gHitNum

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            const location = { i, j }
            renderCellColor(location, "yellow")

            if (gBoard[i][j].isMine) renderCell(location, MINE)

            if (gBoard[i][j].minesAroundCount > 0) renderCell(location, gBoard[i][j].minesAroundCount)
        }
    }


    setTimeout(() => {

        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= gBoard.length) continue
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= gBoard[i].length) continue
                const location = { i, j }
                if (gBoard[i][j].isRevealed) {
                    renderCellColor(location, "white")
                    if (gBoard[i][j].minesAroundCount) {
                        renderCell(location, gBoard[i][j].minesAroundCount)
                    } else renderCell(location, EMPTY)
                } else {
                    renderCellColor(location, "#c4c1c1")
                    if (gBoard[i][j].isMarked) renderCell(location, FLAG)
                    else renderCell(location, EMPTY)
                    
                }
            }
        }

        const elHint = document.querySelector(className)
        elHint.style.display = "none"
        isHint = false


    }, "1500")
}