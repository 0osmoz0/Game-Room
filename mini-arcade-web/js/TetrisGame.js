/**
 * ========================================
 * TETRIS GAME
 * ========================================
 * Le classique Tetris avec des effets néon !
 * Contrôles : Flèches (gauche/droite/bas) + Espace (rotation)
 */

class TetrisGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        
        // Grille
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        
        // Pièces Tetromino
        this.shapes = {
            I: [[1,1,1,1]],
            O: [[1,1],[1,1]],
            T: [[0,1,0],[1,1,1]],
            S: [[0,1,1],[1,1,0]],
            Z: [[1,1,0],[0,1,1]],
            J: [[1,0,0],[1,1,1]],
            L: [[0,0,1],[1,1,1]]
        };
        
        this.colors = {
            I: '#00f0ff',
            O: '#ffff00',
            T: '#b24bf3',
            S: '#00ff00',
            Z: '#ff0000',
            J: '#0000ff',
            L: '#ff8800'
        };
        
        // Pièce actuelle
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        
        // Prochaine pièce
        this.nextPiece = null;
        
        // État
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameActive = false;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        
        this.setupControls();
    }
    
    setupControls() {
        this.keyHandler = (e) => {
            if (!this.gameActive) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.move(-1);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.move(1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.drop();
                    e.preventDefault();
                    break;
                case ' ':
                case 'ArrowUp':
                    this.rotate();
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }
    
    start() {
        this.gameActive = true;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.grid = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        
        window.updateGameScore(0);
        
        this.nextPiece = this.getRandomPiece();
        this.spawnPiece();
        
        this.lastTime = performance.now();
        this.animate();
    }
    
    getRandomPiece() {
        const shapes = Object.keys(this.shapes);
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        return {
            shape: this.shapes[shape],
            color: this.colors[shape],
            type: shape
        };
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        
        this.currentX = Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentY = 0;
        
        // Vérifier si on peut placer la pièce
        if (this.checkCollision(0, 0)) {
            this.endGame();
        }
    }
    
    checkCollision(offsetX, offsetY, piece = this.currentPiece.shape) {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x]) {
                    const newX = this.currentX + x + offsetX;
                    const newY = this.currentY + y + offsetY;
                    
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }
                    
                    if (newY >= 0 && this.grid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    move(dir) {
        if (!this.checkCollision(dir, 0)) {
            this.currentX += dir;
            playSound('click-sound', 0.1);
        }
    }
    
    drop() {
        if (!this.checkCollision(0, 1)) {
            this.currentY++;
            this.score += 1;
            window.updateGameScore(this.score);
        } else {
            this.merge();
        }
    }
    
    hardDrop() {
        while (!this.checkCollision(0, 1)) {
            this.currentY++;
            this.score += 2;
        }
        window.updateGameScore(this.score);
        this.merge();
    }
    
    rotate() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        if (!this.checkCollision(0, 0, rotated)) {
            this.currentPiece.shape = rotated;
            playSound('click-sound', 0.2);
        }
    }
    
    merge() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const gridY = this.currentY + y;
                    const gridX = this.currentX + x;
                    
                    if (gridY >= 0) {
                        this.grid[gridY][gridX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        this.clearLines();
        this.spawnPiece();
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.rows - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                linesCleared++;
                y++; // Vérifier à nouveau cette ligne
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            
            // Calcul du score (Tetris scoring)
            const points = [0, 100, 300, 500, 800];
            this.score += points[linesCleared] * this.level;
            
            // Augmenter le niveau tous les 10 lignes
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            window.updateGameScore(this.score);
            playSound('success-sound', 0.3);
        }
    }
    
    update(deltaTime) {
        if (!this.gameActive) return;
        
        this.dropCounter += deltaTime;
        
        if (this.dropCounter > this.dropInterval) {
            this.drop();
            this.dropCounter = 0;
        }
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
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, this.rows * this.blockSize);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(this.cols * this.blockSize, y * this.blockSize);
            this.ctx.stroke();
        }
        
        // Blocs placés
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.grid[y][x]) {
                    this.drawBlock(x, y, this.grid[y][x]);
                }
            }
        }
        
        // Pièce actuelle
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(
                            this.currentX + x,
                            this.currentY + y,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
        
        // Info panel
        this.drawInfo();
    }
    
    drawBlock(x, y, color) {
        const px = x * this.blockSize;
        const py = y * this.blockSize;
        
        this.ctx.fillStyle = color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.fillRect(px + 1, py + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Effet de brillance
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(px + 2, py + 2, this.blockSize - 4, 4);
        
        this.ctx.shadowBlur = 0;
    }
    
    drawInfo() {
        const startX = this.cols * this.blockSize + 20;
        
        this.ctx.font = 'bold 16px Orbitron, sans-serif';
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText('NIVEAU', startX, 30);
        this.ctx.font = 'bold 24px Orbitron, sans-serif';
        this.ctx.fillText(this.level.toString(), startX, 60);
        
        this.ctx.font = 'bold 16px Orbitron, sans-serif';
        this.ctx.fillText('LIGNES', startX, 100);
        this.ctx.font = 'bold 24px Orbitron, sans-serif';
        this.ctx.fillText(this.lines.toString(), startX, 130);
        
        // Prochaine pièce
        this.ctx.font = 'bold 16px Orbitron, sans-serif';
        this.ctx.fillText('SUIVANT', startX, 180);
        
        if (this.nextPiece) {
            const offsetX = startX;
            const offsetY = 200;
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.ctx.fillStyle = this.nextPiece.color;
                        this.ctx.fillRect(
                            offsetX + x * 20,
                            offsetY + y * 20,
                            18, 18
                        );
                    }
                }
            }
        }
        
        // Contrôles
        this.ctx.font = '12px Rajdhani, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fillText('← → Déplacer', startX, this.canvas.height - 80);
        this.ctx.fillText('↓ Descendre', startX, this.canvas.height - 60);
        this.ctx.fillText('↑ Rotation', startX, this.canvas.height - 40);
        this.ctx.fillText('Espace: Rotation', startX, this.canvas.height - 20);
    }
    
    animate(time = 0) {
        if (!this.gameActive) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((t) => this.animate(t));
    }
    
    endGame() {
        this.gameActive = false;
        playSound('fail-sound', 0.3);
        
        setTimeout(() => {
            window.gameOver(this.score);
        }, 1000);
    }
    
    destroy() {
        this.gameActive = false;
        document.removeEventListener('keydown', this.keyHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

