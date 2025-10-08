/**
 * ========================================
 * TIC-TAC-TOE GAME (Morpion)
 * ========================================
 * Morpion multijoueur en ligne !
 * WebSocket pour jouer contre un adversaire
 */

class TicTacToeGame {
    constructor(canvas, isOnline = false, playerNumber = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = 500;
        this.canvas.height = 500;
        this.canvas.style.display = 'block';
        
        this.isOnline = isOnline;
        this.playerNumber = playerNumber;
        this.mySymbol = playerNumber === 1 ? 'X' : 'O';
        this.opponentSymbol = playerNumber === 1 ? 'O' : 'X';
        this.currentPlayer = 'X';
        
        // Grille 3x3
        this.board = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
        
        this.cellSize = 150;
        this.gameActive = true;
        this.winner = null;
        
        this.setupControls();
        
        if (this.isOnline) {
            this.setupOnlineCallbacks();
        }
    }
    
    setupControls() {
        this.clickHandler = (e) => {
            if (!this.gameActive) return;
            
            // En ligne : ne jouer que pendant son tour
            if (this.isOnline && this.currentPlayer !== this.mySymbol) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const col = Math.floor(x / this.cellSize);
            const row = Math.floor(y / this.cellSize);
            
            if (this.board[row][col] === '') {
                this.makeMove(row, col);
            }
        };
        
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    setupOnlineCallbacks() {
        if (typeof socketClient === 'undefined') return;
        
        socketClient.on('onOpponentAction', (data) => {
            if (data.action === 'move') {
                const { row, col } = data.actionData;
                this.board[row][col] = this.opponentSymbol;
                this.currentPlayer = this.mySymbol;
                this.checkWinner();
                this.draw();
            }
        });
    }
    
    makeMove(row, col) {
        this.board[row][col] = this.currentPlayer;
        
        if (this.isOnline) {
            socketClient.sendAction('move', { row, col });
        }
        
        playSound('click-sound', 0.2);
        
        if (this.checkWinner()) {
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.draw();
    }
    
    checkWinner() {
        // Lignes
        for (let row = 0; row < 3; row++) {
            if (this.board[row][0] && 
                this.board[row][0] === this.board[row][1] && 
                this.board[row][1] === this.board[row][2]) {
                this.endGame(this.board[row][0]);
                return true;
            }
        }
        
        // Colonnes
        for (let col = 0; col < 3; col++) {
            if (this.board[0][col] && 
                this.board[0][col] === this.board[1][col] && 
                this.board[1][col] === this.board[2][col]) {
                this.endGame(this.board[0][col]);
                return true;
            }
        }
        
        // Diagonales
        if (this.board[0][0] && 
            this.board[0][0] === this.board[1][1] && 
            this.board[1][1] === this.board[2][2]) {
            this.endGame(this.board[0][0]);
            return true;
        }
        
        if (this.board[0][2] && 
            this.board[0][2] === this.board[1][1] && 
            this.board[1][1] === this.board[2][0]) {
            this.endGame(this.board[0][2]);
            return true;
        }
        
        // Match nul
        let isFull = true;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.board[row][col] === '') {
                    isFull = false;
                    break;
                }
            }
        }
        
        if (isFull) {
            this.endGame('draw');
            return true;
        }
        
        return false;
    }
    
    draw() {
        // Fond
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(10, 14, 39, 0.95)');
        gradient.addColorStop(1, 'rgba(5, 8, 17, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Grille
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 4;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00f0ff';
        
        // Lignes verticales
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize, 0);
            this.ctx.lineTo(i * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Lignes horizontales
        for (let i = 1; i < 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        this.ctx.shadowBlur = 0;
        
        // Symboles
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const symbol = this.board[row][col];
                if (symbol) {
                    this.drawSymbol(symbol, row, col);
                }
            }
        }
        
        // Indicateur de tour
        this.ctx.font = 'bold 24px Orbitron, sans-serif';
        this.ctx.fillStyle = this.currentPlayer === 'X' ? '#00f0ff' : '#ff2e97';
        this.ctx.textAlign = 'center';
        
        if (this.isOnline) {
            if (this.currentPlayer === this.mySymbol) {
                this.ctx.fillText('Votre tour (' + this.mySymbol + ')', this.canvas.width / 2, 40);
            } else {
                this.ctx.fillText('Tour adversaire...', this.canvas.width / 2, 40);
            }
        } else {
            this.ctx.fillText('Tour: ' + this.currentPlayer, this.canvas.width / 2, 40);
        }
    }
    
    drawSymbol(symbol, row, col) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        const size = this.cellSize * 0.6;
        
        if (symbol === 'X') {
            this.ctx.strokeStyle = '#00f0ff';
            this.ctx.lineWidth = 8;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00f0ff';
            
            this.ctx.beginPath();
            this.ctx.moveTo(x - size / 2, y - size / 2);
            this.ctx.lineTo(x + size / 2, y + size / 2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(x + size / 2, y - size / 2);
            this.ctx.lineTo(x - size / 2, y + size / 2);
            this.ctx.stroke();
        } else {
            this.ctx.strokeStyle = '#ff2e97';
            this.ctx.lineWidth = 8;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#ff2e97';
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size / 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    start() {
        this.draw();
    }
    
    endGame(winner) {
        this.gameActive = false;
        this.winner = winner;
        
        playSound(winner === 'draw' ? 'click-sound' : 'success-sound', 0.3);
        
        setTimeout(() => {
            const score = winner === this.mySymbol || winner === 'X' ? 1 : 0;
            window.gameOver(score);
        }, 1500);
    }
    
    destroy() {
        this.gameActive = false;
        this.canvas.removeEventListener('click', this.clickHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

