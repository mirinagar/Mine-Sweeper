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
var gHintNum
var gLocation
var gSafeClick = 3
var isMegaHint = false
var gMegaHintArr = []
var countMegaHints = 0
var onClickStop = false

gLevel = {
    SIZE: 4,
    MINES: 2
}

function onInit() {
    renderScoreBoards()

    gMineCounter = 0
    isMegaHint = false

    countMegaHints = 0

    gBoard = buildBoard()
    console.log(gBoard)
    isGameOver = false

    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }

    clearInterval(gIntervalTimeId)

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
    const emptyPoss = findEmptyPoss(gBoard)

    for (var i = 0; i < gLevel.MINES; i++) {
        const randIdx = getRandomInt(0, emptyPoss.length)
        const pos = emptyPoss[randIdx]

        board[pos.i][pos.j].type = MINE
        board[pos.i][pos.j].isMine = true
        emptyPoss.splice(randIdx, 1)
    }
}


function findEmptyPoss(board) {
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

    gLocation = { i, j }
    if (onClickStop) return
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

    if (isMegaHint) {
        const location = { i, j }
        gMegaHintArr.push(location)
        if (gMegaHintArr.length === 2) revealMegaHint()
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

}

function checkGameOver() {

    const revealed = gLevel.SIZE ** 2 - gLevel.MINES
    if (gGame.revealedCount === revealed) gameOverWinner()

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
    gHintNum = hintNumber


}

function revealHint(elCell, cellI, cellJ) {
    onClickStop = true
    console.log('HINT')
    const className = '.' + 'hint' + gHintNum

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
        onClickStop = false

    }, "1500")
}

function chooseLightMode() {
    const elBody = document.querySelector('body')
    elBody.classList.add("light")

    const elBtnDark = document.getElementById("btn-dark")
    elBtnDark.classList.remove("hide")

    const elBtnLight = document.getElementById("btn-light")
    elBtnLight.classList.add("hide")


}

function chooseDarkMode() {
    const elBody = document.querySelector('body')
    elBody.classList.remove("light")

    const elBtnLight = document.getElementById("btn-light")
    elBtnLight.classList.remove("hide")

    const elBtnDark = document.getElementById("btn-dark")
    elBtnDark.classList.add("hide")
}

function undoMoves() {
    if (isGameOver || !gGame.isOn) return

    console.log('UNDO')
    var i = gLocation.i
    var j = gLocation.j

    const cell = gBoard[i][j]
    const elCell = document.querySelector(`.cell-${i}-${j}`)

    renderCellColor(gLocation, "#c4c1c1")

    if (gBoard[i][j].isRevealed) {
        gGame.revealedCount--
        gBoard[i][j].isRevealed = false

    }

    if (cell.minesAroundCount) {
        elCell.innerHTML = EMPTY
        renderNumberColor(elCell, cell)
    }

    else if (cell.type === MINE) {
        elCell.innerHTML = EMPTY
    }

    else if (cell.type === EMPTY) {

        elCell.innerHTML = EMPTY
        expandRevealRevers(i, j)
    }

    console.log('CLICK')

}

function expandRevealRevers(cellI, cellJ) {

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

            if (gBoard[i][j].isRevealed) {
                gGame.revealedCount--
                gBoard[i][j].isRevealed = false
                elCell.style.backgroundColor = "#c4c1c1"

                if (cell.minesAroundCount) {
                    renderCell(location, EMPTY)
                }

                else if (cell.type === EMPTY) {
                    renderCell(location, EMPTY)
                    expandRevealRevers(i, j)
                }
            }
        }
    }
}

function activateSafeClick() {
    if (gSafeClick === 0) return
    onClickStop = true
    gSafeClick--
    const emptyPoss = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (!gBoard[i][j].isRevealed && !gBoard[i][j].isMine) {
                var pos = { i, j }
                emptyPoss.push(pos)

            }
        }
    }
    const randIdx = getRandomInt(0, emptyPoss.length)
    const location = emptyPoss[randIdx]
    console.log('location', location)

    renderCellColor(location, "#7ec8eb")

    setTimeout(() => {
        onClickStop = false
        renderCellColor(location, "#c4c1c1")
    }, "1500")


}

function activateMegaHint() {
    if (countMegaHints >= 1) return
    isMegaHint = true

}

function revealMegaHint() {
    onClickStop = true
    countMegaHints++
    console.log('gMegaHintArr', gMegaHintArr)

    for (var i = gMegaHintArr[0].i; i <= gMegaHintArr[1].i; i++) {
        for (var j = gMegaHintArr[0].j; j <= gMegaHintArr[1].j; j++) {
            var location = { i, j }
            console.log('location', location)
            renderCellColor(location, "#ee6291")
            if (gBoard[i][j].isMine) renderCell(location, MINE)
            if (gBoard[i][j].minesAroundCount > 0) renderCell(location, gBoard[i][j].minesAroundCount)
        }
    }


    setTimeout(() => {

        for (var i = gMegaHintArr[0].i; i <= gMegaHintArr[1].i; i++) {
            for (var j = gMegaHintArr[0].j; j <= gMegaHintArr[1].j; j++) {
                var location = { i, j }
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
        onClickStop = false
        gMegaHintArr = []
        isMegaHint = false
    }, "2000")

}