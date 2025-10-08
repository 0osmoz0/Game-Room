/**
 * ========================================
 * CONNECT 4 (Puissance 4)
 * ========================================
 * Puissance 4 multijoueur en ligne !
 */

class Connect4Game {
    constructor(canvas, isOnline = false, playerNumber = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = 700;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        this.isOnline = isOnline;
        this.playerNumber = playerNumber;
        this.myColor = playerNumber === 1 ? '#00f0ff' : '#ff2e97';
        this.opponentColor = playerNumber === 1 ? '#ff2e97' : '#00f0ff';
        this.currentPlayer = 1;
        
        this.rows = 6;
        this.cols = 7;
        this.cellSize = 80;
        this.offsetX = 50;
        this.offsetY = 80;
        
        this.board = [];
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = Array(this.cols).fill(0);
        }
        
        this.gameActive = true;
        this.winner = null;
        this.hoverCol = -1;
        
        this.setupControls();
        
        if (this.isOnline) {
            this.setupOnlineCallbacks();
        }
    }
    
    setupControls() {
        this.mouseMoveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left - this.offsetX;
            this.hoverCol = Math.floor(x / this.cellSize);
            
            if (this.hoverCol < 0 || this.hoverCol >= this.cols) {
                this.hoverCol = -1;
            }
            
            this.draw();
        };
        
        this.clickHandler = (e) => {
            if (!this.gameActive) return;
            
            if (this.isOnline && this.currentPlayer !== this.playerNumber) return;
            
            if (this.hoverCol >= 0) {
                this.dropPiece(this.hoverCol);
            }
        };
        
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    setupOnlineCallbacks() {
        if (typeof socketClient === 'undefined') return;
        
        socketClient.on('onOpponentAction', (data) => {
            if (data.action === 'drop') {
                const { col } = data.actionData;
                this.dropPieceOnline(col, this.opponentColor === '#00f0ff' ? 1 : 2);
            }
        });
    }
    
    dropPiece(col) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                this.board[row][col] = this.currentPlayer;
                
                if (this.isOnline) {
                    socketClient.sendAction('drop', { col });
                }
                
                playSound('click-sound', 0.2);
                
                if (this.checkWinner(row, col)) {
                    this.endGame(this.currentPlayer);
                    return;
                }
                
                if (this.isBoardFull()) {
                    this.endGame(0);
                    return;
                }
                
                this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
                this.draw();
                return;
            }
        }
    }
    
    dropPieceOnline(col, player) {
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === 0) {
                this.board[row][col] = player;
                
                if (this.checkWinner(row, col)) {
                    this.endGame(player);
                    return;
                }
                
                this.currentPlayer = this.playerNumber;
                this.draw();
                return;
            }
        }
    }
    
    checkWinner(row, col) {
        const player = this.board[row][col];
        
        // Horizontal
        let count = 1;
        for (let c = col - 1; c >= 0 && this.board[row][c] === player; c--) count++;
        for (let c = col + 1; c < this.cols && this.board[row][c] === player; c++) count++;
        if (count >= 4) return true;
        
        // Vertical
        count = 1;
        for (let r = row - 1; r >= 0 && this.board[r][col] === player; r--) count++;
        for (let r = row + 1; r < this.rows && this.board[r][col] === player; r++) count++;
        if (count >= 4) return true;
        
        // Diagonale \
        count = 1;
        for (let i = 1; row - i >= 0 && col - i >= 0 && this.board[row - i][col - i] === player; i++) count++;
        for (let i = 1; row + i < this.rows && col + i < this.cols && this.board[row + i][col + i] === player; i++) count++;
        if (count >= 4) return true;
        
        // Diagonale /
        count = 1;
        for (let i = 1; row - i >= 0 && col + i < this.cols && this.board[row - i][col + i] === player; i++) count++;
        for (let i = 1; row + i < this.rows && col - i >= 0 && this.board[row + i][col - i] === player; i++) count++;
        if (count >= 4) return true;
        
        return false;
    }
    
    isBoardFull() {
        for (let col = 0; col < this.cols; col++) {
            if (this.board[0][col] === 0) return false;
        }
        return true;
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
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = this.offsetX + col * this.cellSize;
                const y = this.offsetY + row * this.cellSize;
                
                // Cellule
                this.ctx.fillStyle = 'rgba(50, 50, 100, 0.3)';
                this.ctx.fillRect(x, y, this.cellSize - 4, this.cellSize - 4);
                
                // Pièce
                const piece = this.board[row][col];
                if (piece) {
                    const color = piece === 1 ? '#00f0ff' : '#ff2e97';
                    this.ctx.beginPath();
                    this.ctx.arc(
                        x + this.cellSize / 2 - 2,
                        y + this.cellSize / 2 - 2,
                        this.cellSize / 2 - 10,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fillStyle = color;
                    this.ctx.shadowBlur = 15;
                    this.ctx.shadowColor = color;
                    this.ctx.fill();
                    this.ctx.shadowBlur = 0;
                }
            }
        }
        
        // Preview de la pièce
        if (this.hoverCol >= 0 && this.gameActive) {
            const canDrop = this.board[0][this.hoverCol] === 0;
            
            if (canDrop && (!this.isOnline || this.currentPlayer === this.playerNumber)) {
                const x = this.offsetX + this.hoverCol * this.cellSize;
                const color = this.isOnline ? this.myColor : (this.currentPlayer === 1 ? '#00f0ff' : '#ff2e97');
                
                this.ctx.beginPath();
                this.ctx.arc(
                    x + this.cellSize / 2 - 2,
                    40,
                    this.cellSize / 2 - 10,
                    0,
                    Math.PI * 2
                );
                this.ctx.fillStyle = color;
                this.ctx.globalAlpha = 0.5;
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
        }
        
        // Tour
        this.ctx.font = 'bold 20px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        
        if (this.isOnline) {
            if (this.currentPlayer === this.playerNumber) {
                this.ctx.fillStyle = this.myColor;
                this.ctx.fillText('Votre tour', this.canvas.width / 2, 30);
            } else {
                this.ctx.fillStyle = this.opponentColor;
                this.ctx.fillText('Tour adversaire', this.canvas.width / 2, 30);
            }
        } else {
            const color = this.currentPlayer === 1 ? '#00f0ff' : '#ff2e97';
            this.ctx.fillStyle = color;
            this.ctx.fillText('Joueur ' + this.currentPlayer, this.canvas.width / 2, 30);
        }
    }
    
    start() {
        this.draw();
    }
    
    endGame(winner) {
        this.gameActive = false;
        this.winner = winner;
        
        playSound(winner === 0 ? 'click-sound' : 'success-sound', 0.3);
        
        setTimeout(() => {
            const score = (this.isOnline && winner === this.playerNumber) || (!this.isOnline && winner === 1) ? 1 : 0;
            window.gameOver(score);
        }, 1500);
    }
    
    destroy() {
        this.gameActive = false;
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.removeEventListener('click', this.clickHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

