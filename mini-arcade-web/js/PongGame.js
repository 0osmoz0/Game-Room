/**
 * ========================================
 * PONG GAME
 * ========================================
 * Le classique Pong revisité avec une IA et un style spatial !
 * Affronte l'ordinateur et marque des points
 */

class PongGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration du canvas
        this.canvas.width = 800;
        this.canvas.height = 500;
        this.canvas.style.display = 'block';
        
        // Éléments du jeu
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 8,
            dx: 5,
            dy: 5,
            speed: 5
        };
        
        this.paddleWidth = 12;
        this.paddleHeight = 100;
        
        this.player = {
            x: 30,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            dy: 0,
            speed: 8
        };
        
        this.ai = {
            x: this.canvas.width - 30 - this.paddleWidth,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 4
        };
        
        this.score = 0;
        this.aiScore = 0;
        this.gameActive = false;
        this.keys = {};
        
        // Effets visuels
        this.particles = [];
        this.trail = [];
        this.maxTrailLength = 10;
        
        // Couleurs
        this.colors = {
            player: '#00f0ff',
            ai: '#ff2e97',
            ball: '#b24bf3',
            net: 'rgba(255, 255, 255, 0.2)'
        };
        
        this.setupControls();
    }
    
    setupControls() {
        this.keyDownHandler = (e) => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'w', 's', 'W', 'S'].includes(e.key)) {
                e.preventDefault();
            }
        };
        
        this.keyUpHandler = (e) => {
            this.keys[e.key] = false;
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }
    
    start() {
        this.gameActive = true;
        this.score = 0;
        this.aiScore = 0;
        window.updateGameScore(0);
        
        this.resetBall();
        this.animate();
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        
        // Direction aléatoire
        const angle = (Math.random() * Math.PI / 2) - Math.PI / 4; // -45° à 45°
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        this.ball.dx = Math.cos(angle) * this.ball.speed * direction;
        this.ball.dy = Math.sin(angle) * this.ball.speed;
        
        this.trail = [];
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Contrôles du joueur
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.player.y = Math.max(0, this.player.y - this.player.speed);
        }
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) {
            this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + this.player.speed);
        }
        
        // IA simple (suit la balle)
        const aiCenter = this.ai.y + this.ai.height / 2;
        const ballCenter = this.ball.y;
        
        if (aiCenter < ballCenter - 10) {
            this.ai.y = Math.min(this.canvas.height - this.ai.height, this.ai.y + this.ai.speed);
        } else if (aiCenter > ballCenter + 10) {
            this.ai.y = Math.max(0, this.ai.y - this.ai.speed);
        }
        
        // Ajouter la position actuelle à la traînée
        this.trail.unshift({ x: this.ball.x, y: this.ball.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.pop();
        }
        
        // Mouvement de la balle
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Collision avec le haut et le bas
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.dy *= -1;
            this.createParticles(this.ball.x, this.ball.y, this.colors.ball);
            playSound('click-sound', 0.1);
        }
        
        // Collision avec la raquette du joueur
        if (this.ball.x - this.ball.radius < this.player.x + this.player.width &&
            this.ball.x + this.ball.radius > this.player.x &&
            this.ball.y > this.player.y &&
            this.ball.y < this.player.y + this.player.height) {
            
            // Calculer l'angle de rebond basé sur où la balle touche la raquette
            const hitPos = (this.ball.y - this.player.y) / this.player.height;
            const angle = (hitPos - 0.5) * Math.PI / 3; // -60° à 60°
            
            this.ball.speed += 0.2; // Augmenter légèrement la vitesse
            this.ball.dx = Math.cos(angle) * this.ball.speed;
            this.ball.dy = Math.sin(angle) * this.ball.speed;
            
            this.createParticles(this.ball.x, this.ball.y, this.colors.player);
            playSound('success-sound', 0.2);
        }
        
        // Collision avec la raquette de l'IA
        if (this.ball.x + this.ball.radius > this.ai.x &&
            this.ball.x - this.ball.radius < this.ai.x + this.ai.width &&
            this.ball.y > this.ai.y &&
            this.ball.y < this.ai.y + this.ai.height) {
            
            const hitPos = (this.ball.y - this.ai.y) / this.ai.height;
            const angle = (hitPos - 0.5) * Math.PI / 3;
            
            this.ball.speed += 0.2;
            this.ball.dx = -Math.cos(angle) * this.ball.speed;
            this.ball.dy = Math.sin(angle) * this.ball.speed;
            
            this.createParticles(this.ball.x, this.ball.y, this.colors.ai);
            playSound('success-sound', 0.2);
        }
        
        // Point marqué
        if (this.ball.x - this.ball.radius < 0) {
            // L'IA marque
            this.aiScore++;
            this.checkGameOver();
            this.resetBall();
            playSound('fail-sound', 0.2);
        } else if (this.ball.x + this.ball.radius > this.canvas.width) {
            // Le joueur marque
            this.score++;
            window.updateGameScore(this.score);
            this.resetBall();
            playSound('success-sound', 0.3);
        }
        
        // Mettre à jour les particules
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            return p.life > 0;
        });
    }
    
    draw() {
        // Fond avec gradient
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(10, 14, 39, 0.95)');
        gradient.addColorStop(1, 'rgba(5, 8, 17, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ligne centrale en pointillés
        this.ctx.strokeStyle = this.colors.net;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Scores
        this.ctx.font = 'bold 48px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        
        // Score joueur
        this.ctx.fillStyle = this.colors.player;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.colors.player;
        this.ctx.fillText(this.score.toString(), this.canvas.width / 4, 60);
        
        // Score IA
        this.ctx.fillStyle = this.colors.ai;
        this.ctx.shadowColor = this.colors.ai;
        this.ctx.fillText(this.aiScore.toString(), 3 * this.canvas.width / 4, 60);
        
        this.ctx.shadowBlur = 0;
        
        // Traînée de la balle
        this.trail.forEach((pos, index) => {
            const alpha = (this.maxTrailLength - index) / this.maxTrailLength;
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.ball.radius * alpha, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(178, 75, 243, ${alpha * 0.5})`;
            this.ctx.fill();
        });
        
        // Raquette du joueur avec glow
        this.ctx.fillStyle = this.colors.player;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.colors.player;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Raquette de l'IA
        this.ctx.fillStyle = this.colors.ai;
        this.ctx.shadowColor = this.colors.ai;
        this.ctx.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);
        
        // Balle avec glow
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.ball;
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = this.colors.ball;
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // Particules
        this.particles.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.life;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        });
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 1,
                color: color
            });
        }
    }
    
    animate() {
        if (!this.gameActive) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    checkGameOver() {
        // Game over si l'IA atteint 5 points
        if (this.aiScore >= 5) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameActive = false;
        
        // Effet de fin
        this.ctx.fillStyle = 'rgba(255, 46, 151, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        playSound('fail-sound', 0.3);
        
        setTimeout(() => {
            window.gameOver(this.score);
        }, 1000);
    }
    
    destroy() {
        this.gameActive = false;
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Le canvas a une taille fixe
    }
}

