/**
 * ========================================
 * BREAKOUT GAME (Arkanoid)
 * ========================================
 * Casse-briques spatial avec power-ups !
 * Contrôles : Souris ou Flèches gauche/droite
 */

class BreakoutGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = 700;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        // Raquette
        this.paddle = {
            width: 100,
            height: 15,
            x: 0,
            y: 0,
            speed: 10,
            color: '#00f0ff'
        };
        
        // Balle
        this.ball = {
            x: 0,
            y: 0,
            radius: 8,
            dx: 5,
            dy: -5,
            speed: 5,
            color: '#ff2e97'
        };
        
        // Briques
        this.brickRows = 6;
        this.brickCols = 10;
        this.brickWidth = 60;
        this.brickHeight = 20;
        this.brickPadding = 5;
        this.brickOffsetTop = 60;
        this.brickOffsetLeft = 35;
        this.bricks = [];
        
        // Couleurs par ligne
        this.brickColors = [
            '#ff0000', '#ff8800', '#ffff00',
            '#00ff00', '#00f0ff', '#b24bf3'
        ];
        
        this.score = 0;
        this.lives = 3;
        this.gameActive = false;
        this.mouseX = 0;
        this.keys = {};
        
        this.setupControls();
        this.initBricks();
    }
    
    setupControls() {
        this.mouseMoveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        };
        
        this.keyDownHandler = (e) => {
            this.keys[e.key] = true;
            if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        };
        
        this.keyUpHandler = (e) => {
            this.keys[e.key] = false;
        };
        
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }
    
    initBricks() {
        this.bricks = [];
        for (let row = 0; row < this.brickRows; row++) {
            this.bricks[row] = [];
            for (let col = 0; col < this.brickCols; col++) {
                this.bricks[row][col] = {
                    x: 0,
                    y: 0,
                    status: 1,
                    color: this.brickColors[row],
                    points: (this.brickRows - row) * 10
                };
            }
        }
    }
    
    start() {
        this.gameActive = true;
        this.score = 0;
        this.lives = 3;
        
        this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
        this.paddle.y = this.canvas.height - 40;
        
        this.resetBall();
        this.initBricks();
        
        window.updateGameScore(0);
        this.animate();
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 60;
        
        const angle = (Math.random() * 60 - 30) * Math.PI / 180; // -30° à 30°
        this.ball.dx = Math.sin(angle) * this.ball.speed;
        this.ball.dy = -Math.cos(angle) * this.ball.speed;
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Mouvement de la raquette
        if (this.keys['ArrowLeft']) {
            this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
        }
        if (this.keys['ArrowRight']) {
            this.paddle.x = Math.min(this.canvas.width - this.paddle.width, this.paddle.x + this.paddle.speed);
        }
        
        // Souris
        if (this.mouseX > 0) {
            this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.mouseX - this.paddle.width / 2));
        }
        
        // Mouvement de la balle
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Collision avec les murs
        if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.dx *= -1;
            playSound('click-sound', 0.1);
        }
        
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy *= -1;
            playSound('click-sound', 0.1);
        }
        
        // Collision avec la raquette
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {
            
            // Angle de rebond basé sur où la balle touche la raquette
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            const angle = (hitPos - 0.5) * Math.PI / 3; // -60° à 60°
            
            this.ball.dx = Math.sin(angle) * this.ball.speed;
            this.ball.dy = -Math.abs(Math.cos(angle) * this.ball.speed);
            
            playSound('success-sound', 0.2);
        }
        
        // Balle perdue
        if (this.ball.y - this.ball.radius > this.canvas.height) {
            this.lives--;
            
            if (this.lives > 0) {
                this.resetBall();
                playSound('fail-sound', 0.3);
            } else {
                this.endGame();
            }
        }
        
        // Collision avec les briques
        this.checkBrickCollision();
        
        // Vérifier victoire
        if (this.checkWin()) {
            this.score += 1000;
            window.updateGameScore(this.score);
            playSound('success-sound', 0.5);
            
            setTimeout(() => {
                this.endGame();
            }, 1000);
        }
    }
    
    checkBrickCollision() {
        for (let row = 0; row < this.brickRows; row++) {
            for (let col = 0; col < this.brickCols; col++) {
                const brick = this.bricks[row][col];
                
                if (brick.status === 1) {
                    brick.x = col * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                    brick.y = row * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                    
                    if (this.ball.x > brick.x &&
                        this.ball.x < brick.x + this.brickWidth &&
                        this.ball.y > brick.y &&
                        this.ball.y < brick.y + this.brickHeight) {
                        
                        this.ball.dy *= -1;
                        brick.status = 0;
                        this.score += brick.points;
                        window.updateGameScore(this.score);
                        playSound('success-sound', 0.2);
                    }
                }
            }
        }
    }
    
    checkWin() {
        for (let row = 0; row < this.brickRows; row++) {
            for (let col = 0; col < this.brickCols; col++) {
                if (this.bricks[row][col].status === 1) {
                    return false;
                }
            }
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
        
        // Briques
        for (let row = 0; row < this.brickRows; row++) {
            for (let col = 0; col < this.brickCols; col++) {
                const brick = this.bricks[row][col];
                
                if (brick.status === 1) {
                    this.ctx.fillStyle = brick.color;
                    this.ctx.shadowBlur = 10;
                    this.ctx.shadowColor = brick.color;
                    this.ctx.fillRect(brick.x, brick.y, this.brickWidth, this.brickHeight);
                    
                    // Bordure brillante
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(brick.x + 2, brick.y + 2, this.brickWidth - 4, 3);
                    
                    this.ctx.shadowBlur = 0;
                }
            }
        }
        
        // Raquette
        this.ctx.fillStyle = this.paddle.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.paddle.color;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        this.ctx.shadowBlur = 0;
        
        // Balle
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.ball.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Vies
        this.ctx.font = 'bold 20px Orbitron, sans-serif';
        this.ctx.fillStyle = '#ff2e97';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Vies: ' + '❤️'.repeat(this.lives), this.canvas.width - 20, 30);
        
        // Instructions
        this.ctx.font = '14px Rajdhani, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Souris ou ← → pour déplacer', this.canvas.width / 2, this.canvas.height - 10);
    }
    
    animate() {
        if (!this.gameActive) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    endGame() {
        this.gameActive = false;
        
        setTimeout(() => {
            window.gameOver(this.score);
        }, 500);
    }
    
    destroy() {
        this.gameActive = false;
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

