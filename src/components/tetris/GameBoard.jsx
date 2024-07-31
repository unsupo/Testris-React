import {
    BOARD_HEIGHT,
    BOARD_WIDTH, calculateScore,
    CELL_SIZE, DEFAULT_BORDER, DEFAULT_COLOR,
    DEFAULT_GRID,
    DefaultTetrisPieces,
    GAME_STATES, INITIAL_GAME_SPEED,
    NUMBER_OF_UPCOMING_PIECES,
} from "./Constants";
import {useEffect, useRef, useState} from "react";
import {clone, rotateMatrix} from "./utils";
import Menu from "./menu/Menu";

function GameBoard () {
    const initializeGameBoard = () => {
        const board = [];
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            const rowArray = [];
            for (let col = 0; col < BOARD_WIDTH; col++) {
                rowArray.push({...DEFAULT_GRID});
            }
            board.push(rowArray);
        }
        return board;
    };
    const getColumnPosition = (shape) => Math.floor((BOARD_WIDTH - shape[0].length) / 2);
    const generateRandomPiece = () => Math.floor(Math.random() * DefaultTetrisPieces.length);
    // Function to generate upcoming Tetris pieces
    const generateUpcomingPieces = () => Array.from({ length: NUMBER_OF_UPCOMING_PIECES }, generateRandomPiece);

    const [gameBoard, setGameBoard] = useState(initializeGameBoard());
    const requestRef = useRef();
    const lastUpdateTimeRef = useRef(0);
    const progressTimeRef = useRef(0);
    const lockTimeRef = useRef(0);
    const isWaitingToLockRef = useRef(false);
    const lockTimeDelayRef = useRef(1000);
    const gameState = useRef(GAME_STATES.NEW_GAME);
    const speed = useRef(INITIAL_GAME_SPEED); // initial game speed
    const currentPieceNumber = useRef(generateRandomPiece()); // random number indicating which piece
    const currentShape = useRef(DefaultTetrisPieces[currentPieceNumber.current].shape);
    const currentPiecePosition = useRef([0, getColumnPosition(currentShape.current)]);
    const upcomingPieces = useRef(generateUpcomingPieces()); // 3 random numbers indicating which piece
    const ghostRowPosition = useRef(BOARD_HEIGHT-1); // default ghost is at bottom of board
    const [score, setScore] = useState(0); // TODO is a particular state actually a ref?
    const [level, setLevel] = useState(1); // TODO logic for increasing game level which increases speed
    const [lineCleared, setLineCleared] = useState(0); // TODO logic for increasing game level which increases speed


    function checkCollision(shape, board, startRow, startCol) {
        // Check collision between the piece and the board
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] === 0) {
                    continue;
                }
                const blockRow = startRow + i;
                const blockCol = startCol + j;
                // Check if the block is out of bounds or collides with an existing block
                if (blockCol < 0 || blockCol >= BOARD_WIDTH || blockRow >= BOARD_HEIGHT || (board[blockRow] && board[blockRow][blockCol] && board[blockRow][blockCol].isPlaced)) {
                    return true;
                }
            }
        }
        return false;
    }
    function drawPiece(shape, color, border, board, initRow, initCol, isGhost = false, isPlaced = false, isErased = false) {
        for (let row = 0; row < shape.length; row++) {
            for (let column = 0; column < shape[row].length; column++) {
                try {
                    if (shape[row][column] === 0 || board[row + initRow][column + initCol].isPlaced) // || board[row + initRow][column + initCol].isActive)
                        continue;
                    board[row+initRow][column+initCol].color = (isGhost && !board[row+initRow][column+initCol].isActive) || isErased ? DEFAULT_COLOR : color;
                    board[row+initRow][column+initCol].border = !isGhost || isErased ? DEFAULT_BORDER : border;
                    board[row+initRow][column+initCol].isGhost = isGhost;
                    board[row+initRow][column+initCol].isPlaced = isPlaced;
                    board[row+initRow][column+initCol].isActive = !isErased && !isGhost;
                }catch (e) { // I expect this to fail when it's game over, does it ever fail when it's not?
                    // console.log(e);
                    gameState.current = GAME_STATES.GAME_OVER;
                    return;
                }
            }
        }
        return board;
    }
    const drawGhostPiece = (shape, board) => {
        for (let row = 0; row < BOARD_HEIGHT; row++) {
            if(checkCollision(shape, board, currentPiecePosition.current[0]+row, currentPiecePosition.current[1])){
                // Render the ghost piece at the bottom position
                ghostRowPosition.current = currentPiecePosition.current[0]+row-1;
                const piece = DefaultTetrisPieces[currentPieceNumber.current];
                return drawPiece(shape,piece.tcolor,piece.border, board, currentPiecePosition.current[0]+row-1,currentPiecePosition.current[1], true);
            }
        }
        return board;
    }
    const erasePiece = (board) => {
        const piece = DefaultTetrisPieces[currentPieceNumber.current];
        const boardWithoutPiece = drawPiece(currentShape.current, piece.tcolor, piece.border, board, currentPiecePosition.current[0], currentPiecePosition.current[1], false, false,true);
        return drawPiece(currentShape.current, piece.tcolor, piece.border, boardWithoutPiece, ghostRowPosition.current, currentPiecePosition.current[1], false, false,true);
    }
    const drawPieceWithGhost = (board) => {// board is cloned before coming here
        const piece = DefaultTetrisPieces[currentPieceNumber.current];
        const boardWithPiece = drawPiece(currentShape.current, piece.tcolor, piece.border, board, currentPiecePosition.current[0], currentPiecePosition.current[1]);
        const newBoard = clone(drawGhostPiece(currentShape.current, boardWithPiece));
        setGameBoard(newBoard);
    }
    const moveCurrentPiece = (newRow, newColumn) => {
        if(!checkCollision(currentShape.current, gameBoard, newRow, newColumn)) {
            const erasedBoard = erasePiece(gameBoard);
            currentPiecePosition.current = [newRow, newColumn];
            drawPieceWithGhost(erasedBoard);
        }
    }
    const checkForLineClears = (board) => {
        const isFullRow = (row, board) => {
            let isFullRow = true;
            for (let column = 0; column < board[row].length; column++) {
                if (!board[row][column].isPlaced) {
                    isFullRow = false;
                    break;
                }
            }
            return isFullRow;
        }
        let clearedLines = 0;
        let row = board.length;
        let moveCount = 0;
        let isFull = false;
        while (row-- > 0){
            if(isFullRow(row, board)){
                clearedLines++;
                moveCount++;
                isFull = true;
            }else
                isFull = false;
            if(!isFull && moveCount > 0){
                // move all rows above row down moveCount rows, but need to avoid active not placed pieces by removing currentPiece
                for (let i = 0; i < row; i++) {
                    board[row + moveCount - i] = clone(board[row - i]);
                }
                moveCount = 0;
                row = board.length;
            }
        }
        if(clearedLines > 0) { // TODO check for tspin (400) single LC (800), double (1200), triple (1600) and back to back (0.5*tetris or t-spin)
            const newScore = score + calculateScore(clearedLines)*level; // all new scores are multipled by level
            setScore(newScore);
            const newLinesCleared = lineCleared + clearedLines;
            setLineCleared(newLinesCleared);
            const newLevel = Math.floor(newLinesCleared/10)+1;
            if(newLevel > level) {
                speed.current+=100;
                setLevel(newLevel);
                lockTimeDelayRef.current*=.9;
            }
        }
        return board;
    }
    const update = (time) => {
        requestRef.current = requestAnimationFrame(update)
        if (gameState.current === GAME_STATES.NEW_GAME) {
            // draw current piece and ghost update game state
            drawPieceWithGhost(gameBoard);
            // gameState.current = GAME_STATES.PLAYING;
            return
        } else if(gameState.current === GAME_STATES.GAME_OVER){
            return ;
        }
        if (!lastUpdateTimeRef.current) {
            lastUpdateTimeRef.current = time
        }
        const deltaTime = time - lastUpdateTimeRef.current
        progressTimeRef.current += deltaTime
        if(isWaitingToLockRef.current){
            lockTimeRef.current += deltaTime;
        }
        if (progressTimeRef.current > speed.current) {
            // we're currently waiting for lock time, do nothing, this only prevents natural drops not user controls
            if(isWaitingToLockRef.current && lockTimeRef.current < lockTimeDelayRef.current){
                return;
            }
            // we're not waiting for a lock so proceed to drop as normal
            if(!isWaitingToLockRef.current) {
                moveCurrentPiece(currentPiecePosition.current[0] + 1, currentPiecePosition.current[1]);
                progressTimeRef.current = 0;
            }
            // TODO reset lock stuff if not collision           isWaitingToLockRef.current ||
            if(checkCollision(currentShape.current, gameBoard, currentPiecePosition.current[0]+1, currentPiecePosition.current[1])) {
                // I want to lock, but need to delay, if it's false then we haven't waited for this yet
                if(!isWaitingToLockRef.current) {
                    isWaitingToLockRef.current = true;
                    lockTimeRef.current = 0;
                    return;
                }
                // place piece, check for breaks, spawn new piece from upcoming pieces
                // place current piece
                const currentPiece = DefaultTetrisPieces[currentPieceNumber.current];
                const boardWithPiece = drawPiece(currentShape.current, currentPiece.tcolor, currentPiece.border, gameBoard, currentPiecePosition.current[0], currentPiecePosition.current[1], false, true);
                // setGameBoard(clone(boardWithPiece));
                // check for breaks
                const boardAfterLineClears = checkForLineClears(boardWithPiece);
                // set next upcoming piece and current piece from upcomingPieces
                currentPieceNumber.current = upcomingPieces.current.pop();
                upcomingPieces.current.push(generateRandomPiece());
                const piece = DefaultTetrisPieces[currentPieceNumber.current];
                const shape = piece.shape;
                const position = [0,getColumnPosition(shape)];
                currentPiecePosition.current = position;
                currentShape.current = shape;
                if(checkCollision(shape, boardAfterLineClears, position[0], position[1])) {
                    // this is game over
                    console.log('game over');
                    setGameBoard(drawPiece(shape, piece.tcolor, piece.border, boardAfterLineClears, position[0], position[1], false, true, false));
                    return gameState.current = GAME_STATES.GAME_OVER;
                }
                // draw new piece
                drawPieceWithGhost(boardAfterLineClears);
                // reset locking
                isWaitingToLockRef.current = false;
                console.log(level+", "+score);
                console.log('placed');
            } else {
                isWaitingToLockRef.current = false;
            }
        }
        lastUpdateTimeRef.current = time
    }

    useEffect(() => {
        requestRef.current = requestAnimationFrame(update)
        return () => cancelAnimationFrame(requestRef.current)
    }, [gameState, level, score, lineCleared]);
    const rotateCurrentPiece = () =>{
        const shape = rotateMatrix(currentShape.current);
        if(checkCollision(shape, gameBoard, currentPiecePosition.current[0], currentPiecePosition.current[1])) {
            // Check how much the piece needs to be shifted (either left or right)
            // Calculate maximum allowed shift based on piece shape
            const maxShift = Math.max(...shape.map((row) => row.filter(Boolean).length)) - 1;
            let shiftAmount = 0;
            for (let i = 0; i < maxShift; i++) {
                if (checkCollision(shape, gameBoard, currentPiecePosition.current[0], currentPiecePosition.current[1] + shiftAmount)) {
                    shiftAmount++; // Keep shifting right until no collision
                }
            }
            shiftAmount = 0;
            // tried moving right and didn't help, now try moving left
            if (checkCollision(shape, gameBoard, currentPiecePosition.current[0], currentPiecePosition.current[1] + shiftAmount)) { // Shifted right, check if it can go left instead
                for (let i = 0; i < maxShift; i++) {
                    if (checkCollision(shape, gameBoard, currentPiecePosition.current[0], currentPiecePosition.current[1] + shiftAmount)) {
                        shiftAmount--; // Keep shifting right until no collision
                    }
                }
            }
            // Apply the calculated shift
            currentPiecePosition.current[1] += shiftAmount;
        }
        // piece.previousPiece = clonePiece(currentPiece);
        currentShape.current = shape;
    }
    const handleKeyDown = (event) => {
        event.preventDefault(); // TODO give user ability to remap controls
        switch (event.key) {
            case 'ArrowLeft':
                // Handle left arrow key  -  Move Tetris piece left
                moveCurrentPiece(currentPiecePosition.current[0],currentPiecePosition.current[1]-1);
                break;
            case 'ArrowRight':
                // Handle right arrow key  -  Move Tetris piece right
                moveCurrentPiece(currentPiecePosition.current[0],currentPiecePosition.current[1]+1);
                break;
            case 'ArrowDown':
                // Handle down arrow key -  Move Tetris piece down
                moveCurrentPiece(currentPiecePosition.current[0]+1,currentPiecePosition.current[1]);
                // this is a soft drop score increases 1xdistance
                setScore(score+1);
                break;
            case ' ':
                // TODO hard drop should set lock time to 0?
                setScore(score+2*(ghostRowPosition.current - currentPiecePosition.current[0]));
                moveCurrentPiece(ghostRowPosition.current,currentPiecePosition.current[1]);
                isWaitingToLockRef.current = true;
                lockTimeRef.current = 1000000;
                // this is a hard drop, score increases 2 x distance
                break;
            case 'ArrowUp':
                // Handle spacebar  -  Rotate Tetris piece
                const erasedBoard = erasePiece(gameBoard);
                rotateCurrentPiece();
                drawPieceWithGhost(erasedBoard);
                break;
            default:
                break; // TODO rotate right is up done, but rotate left is z.  HOLD is c and pause is esc
                // TODO add mouse input, left is hard drop, right is hold, left and right is tracked by mouse
        }
    }
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown); // Clean up event listener
    }, [score]);

    return (
        <div>{gameState.current === GAME_STATES.PLAYING ?
            <div // game div
                className="grid grid-cols-10 grid-rows-20 gap-px bg-gray-700" // gap-1
                style={{ width: `${BOARD_WIDTH * CELL_SIZE}px`, height: `${BOARD_HEIGHT * CELL_SIZE}px` }}
            >
                {gameBoard.map((row, rowIndex) =>
                    row.map((col, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`border rounded ${ col.border } ${ col.color }`} // rounded-sm
                        />
                    ))
                )}
            </div> : <Menu /> // this will be the menu div when you're not in playing state
        }
        </div>
    );
}

export default GameBoard;