/**
 * ========================================
 * FLAPPY BIRD GAME
 * ========================================
 * Flappy Bird spatial ! Difficile mais addictif
 * Contrôles : Espace ou Clic pour sauter
 */

class FlappyGame {
    constructor(canvas, htmlContainer) {
        this.canvas = canvas;
        this.htmlContainer = htmlContainer;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        this.htmlContainer.style.display = 'none';
        
        // Oiseau
        this.bird = {
            x: 100,
            y: 300,
            radius: 15,
            velocity: 0,
            gravity: 0.6,
            jump: -10,
            color: '#00f0ff'
        };
        
        // Tuyaux
        this.pipes = [];
        this.pipeWidth = 60;
        this.pipeGap = 150;
        this.pipeSpeed = 3;
        this.pipeSpawnTimer = 0;
        this.pipeSpawnInterval = 90;
        
        this.score = 0;
        this.gameActive = false;
        this.gameStarted = false;
        
        this.setupControls();
    }
    
    setupControls() {
        this.keyHandler = (e) => {
            if (e.key === ' ' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.flap();
            }
        };
        
        this.clickHandler = () => {
            this.flap();
        };
        
        document.addEventListener('keydown', this.keyHandler);
        this.canvas.addEventListener('click', this.clickHandler);
    }
    
    flap() {
        if (!this.gameActive) {
            if (!this.gameStarted) {
                this.start();
            }
            return;
        }
        
        this.bird.velocity = this.bird.jump;
        playSound('click-sound', 0.2);
    }
    
    start() {
        this.gameActive = true;
        this.gameStarted = true;
        this.score = 0;
        this.bird.y = 300;
        this.bird.velocity = 0;
        this.pipes = [];
        this.pipeSpawnTimer = 0;
        
        window.updateGameScore(0);
        this.animate();
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Gravité
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        // Limite rotation
        this.bird.velocity = Math.min(this.bird.velocity, 15);
        
        // Spawn tuyaux
        this.pipeSpawnTimer++;
        if (this.pipeSpawnTimer >= this.pipeSpawnInterval) {
            this.spawnPipe();
            this.pipeSpawnTimer = 0;
        }
        
        // Mouvement tuyaux
        this.pipes = this.pipes.filter(pipe => {
            pipe.x -= this.pipeSpeed;
            
            // Marquer le score
            if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.passed = true;
                this.score++;
                window.updateGameScore(this.score);
                playSound('success-sound', 0.2);
            }
            
            return pipe.x > -this.pipeWidth;
        });
        
        // Collision avec le sol ou plafond
        if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.canvas.height) {
            this.endGame();
        }
        
        // Collision avec tuyaux
        for (let pipe of this.pipes) {
            if (this.bird.x + this.bird.radius > pipe.x &&
                this.bird.x - this.bird.radius < pipe.x + this.pipeWidth) {
                
                if (this.bird.y - this.bird.radius < pipe.topHeight ||
                    this.bird.y + this.bird.radius > pipe.topHeight + this.pipeGap) {
                    this.endGame();
                    break;
                }
            }
        }
    }
    
    spawnPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - 50;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            passed: false,
            color: this.getRandomColor()
        });
    }
    
    getRandomColor() {
        const colors = ['#ff2e97', '#b24bf3', '#00f0ff', '#4361ee'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    draw() {
        // Fond
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(10, 14, 39, 0.95)');
        gradient.addColorStop(1, 'rgba(30, 20, 50, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Tuyaux
        this.pipes.forEach(pipe => {
            this.ctx.fillStyle = pipe.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = pipe.color;
            
            // Tuyau haut
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            
            // Tuyau bas
            this.ctx.fillRect(pipe.x, pipe.topHeight + this.pipeGap, this.pipeWidth, this.canvas.height);
            
            this.ctx.shadowBlur = 0;
        });
        
        // Oiseau
        const rotation = Math.min(Math.max(this.bird.velocity / 10, -0.5), 0.5);
        
        this.ctx.save();
        this.ctx.translate(this.bird.x, this.bird.y);
        this.ctx.rotate(rotation);
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.bird.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.bird.color;
        this.ctx.fill();
        
        // Œil
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(5, -5, 6, 6);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(7, -3, 3, 3);
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
        
        // Instructions
        if (!this.gameStarted) {
            this.ctx.font = 'bold 24px Orbitron, sans-serif';
            this.ctx.fillStyle = '#00f0ff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Clique ou Espace', this.canvas.width / 2, this.canvas.height / 2 - 50);
            this.ctx.fillText('pour commencer !', this.canvas.width / 2, this.canvas.height / 2 - 20);
        }
        
        // Score
        this.ctx.font = 'bold 48px Orbitron, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(this.score.toString(), this.canvas.width / 2, 60);
        this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 60);
    }
    
    animate() {
        if (!this.gameActive) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    endGame() {
        this.gameActive = false;
        this.gameStarted = false;
        playSound('fail-sound', 0.3);
        
        setTimeout(() => {
            window.gameOver(this.score);
        }, 500);
    }
    
    destroy() {
        this.gameActive = false;
        this.gameStarted = false;
        document.removeEventListener('keydown', this.keyHandler);
        this.canvas.removeEventListener('click', this.clickHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

