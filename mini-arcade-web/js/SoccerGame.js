/**
 * ========================================
 * SOCCER GAME (Football)
 * ========================================
 * Football multijoueur style arcade !
 * Joueur 1: WASD | Joueur 2: Flèches
 */

class SoccerGame {
    constructor(canvas, isOnline = false, playerNumber = null) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = 900;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        this.isOnline = isOnline;
        this.playerNumber = playerNumber;
        
        // Joueurs
        this.player1 = {
            x: 200,
            y: 300,
            radius: 20,
            speed: 5,
            color: '#00f0ff',
            score: 0
        };
        
        this.player2 = {
            x: 700,
            y: 300,
            radius: 20,
            speed: 5,
            color: '#ff2e97',
            score: 0
        };
        
        // Ballon
        this.ball = {
            x: 450,
            y: 300,
            radius: 12,
            vx: 0,
            vy: 0,
            maxSpeed: 15,
            friction: 0.98,
            color: '#ffffff'
        };
        
        // Buts
        this.goalSize = 150;
        this.goalDepth = 20;
        
        this.keys = {};
        this.gameActive = false;
        this.maxScore = 5;
        
        this.setupControls();
        
        if (this.isOnline) {
            this.setupOnlineCallbacks();
        }
    }
    
    setupControls() {
        this.keyDownHandler = (e) => {
            this.keys[e.key] = true;
            this.keys[e.key.toLowerCase()] = true;
            
            if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };
        
        this.keyUpHandler = (e) => {
            this.keys[e.key] = false;
            this.keys[e.key.toLowerCase()] = false;
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }
    
    setupOnlineCallbacks() {
        if (typeof socketClient === 'undefined') return;
        
        socketClient.on('onOpponentMove', (data) => {
            const opponent = this.playerNumber === 1 ? this.player2 : this.player1;
            opponent.x = data.position.x;
            opponent.y = data.position.y;
        });
        
        socketClient.on('onOpponentAction', (data) => {
            if (data.action === 'ballUpdate' && this.playerNumber === 2) {
                this.ball = data.actionData.ball;
            }
        });
    }
    
    start() {
        this.gameActive = true;
        this.resetPositions();
        window.updateGameScore(0);
        this.animate();
    }
    
    resetPositions() {
        this.player1.x = 200;
        this.player1.y = 300;
        this.player2.x = 700;
        this.player2.y = 300;
        this.ball.x = 450;
        this.ball.y = 300;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Mouvement joueur 1
        if (this.keys['w']) this.player1.y = Math.max(this.player1.radius, this.player1.y - this.player1.speed);
        if (this.keys['s']) this.player1.y = Math.min(this.canvas.height - this.player1.radius, this.player1.y + this.player1.speed);
        if (this.keys['a']) this.player1.x = Math.max(this.player1.radius, this.player1.x - this.player1.speed);
        if (this.keys['d']) this.player1.x = Math.min(this.canvas.width - this.player1.radius, this.player1.x + this.player1.speed);
        
        // Mouvement joueur 2
        if (!this.isOnline || this.playerNumber === 2) {
            if (this.keys['ArrowUp']) this.player2.y = Math.max(this.player2.radius, this.player2.y - this.player2.speed);
            if (this.keys['ArrowDown']) this.player2.y = Math.min(this.canvas.height - this.player2.radius, this.player2.y + this.player2.speed);
            if (this.keys['ArrowLeft']) this.player2.x = Math.max(this.player2.radius, this.player2.x - this.player2.speed);
            if (this.keys['ArrowRight']) this.player2.x = Math.min(this.canvas.width - this.player2.radius, this.player2.x + this.player2.speed);
        }
        
        // Envoyer position en ligne
        if (this.isOnline) {
            const myPlayer = this.playerNumber === 1 ? this.player1 : this.player2;
            socketClient.sendMove({ x: myPlayer.x, y: myPlayer.y });
        }
        
        // Mouvement ballon
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // Friction
        this.ball.vx *= this.ball.friction;
        this.ball.vy *= this.ball.friction;
        
        // Collisions avec murs haut/bas
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.vy *= -0.8;
            this.ball.y = this.ball.y < this.canvas.height / 2 ? this.ball.radius : this.canvas.height - this.ball.radius;
            playSound('click-sound', 0.1);
        }
        
        // Vérifier buts
        this.checkGoals();
        
        // Collisions avec joueurs
        this.checkPlayerCollision(this.player1);
        this.checkPlayerCollision(this.player2);
        
        // Limiter vitesse ballon
        const speed = Math.sqrt(this.ball.vx ** 2 + this.ball.vy ** 2);
        if (speed > this.ball.maxSpeed) {
            this.ball.vx = (this.ball.vx / speed) * this.ball.maxSpeed;
            this.ball.vy = (this.ball.vy / speed) * this.ball.maxSpeed;
        }
        
        // Synchroniser ballon en ligne (seulement joueur 1)
        if (this.isOnline && this.playerNumber === 1) {
            socketClient.sendAction('ballUpdate', { ball: this.ball });
        }
    }
    
    checkPlayerCollision(player) {
        const dx = this.ball.x - player.x;
        const dy = this.ball.y - player.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance < this.ball.radius + player.radius) {
            const angle = Math.atan2(dy, dx);
            const power = 8;
            
            this.ball.vx = Math.cos(angle) * power;
            this.ball.vy = Math.sin(angle) * power;
            
            // Séparer
            const overlap = this.ball.radius + player.radius - distance;
            this.ball.x += Math.cos(angle) * overlap;
            this.ball.y += Math.sin(angle) * overlap;
            
            playSound('success-sound', 0.2);
        }
    }
    
    checkGoals() {
        const goalTop = (this.canvas.height - this.goalSize) / 2;
        const goalBottom = goalTop + this.goalSize;
        
        // But gauche (joueur 1 défend)
        if (this.ball.x - this.ball.radius < 0) {
            if (this.ball.y > goalTop && this.ball.y < goalBottom) {
                this.player2.score++;
                this.onGoal(2);
            } else {
                this.ball.vx *= -0.8;
                this.ball.x = this.ball.radius;
            }
        }
        
        // But droit (joueur 2 défend)
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            if (this.ball.y > goalTop && this.ball.y < goalBottom) {
                this.player1.score++;
                this.onGoal(1);
            } else {
                this.ball.vx *= -0.8;
                this.ball.x = this.canvas.width - this.ball.radius;
            }
        }
    }
    
    onGoal(scorer) {
        playSound('success-sound', 0.5);
        
        const totalScore = this.player1.score + this.player2.score;
        window.updateGameScore(totalScore);
        
        if (this.player1.score >= this.maxScore || this.player2.score >= this.maxScore) {
            setTimeout(() => this.endGame(), 1500);
        } else {
            setTimeout(() => this.resetPositions(), 1500);
        }
    }
    
    draw() {
        // Fond terrain
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
        gradient.addColorStop(0, 'rgba(0, 100, 0, 0.3)');
        gradient.addColorStop(0.5, 'rgba(0, 150, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 100, 0, 0.3)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ligne médiane
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Cercle central
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 60, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Buts
        const goalTop = (this.canvas.height - this.goalSize) / 2;
        
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
        this.ctx.fillRect(0, goalTop, this.goalDepth, this.goalSize);
        
        this.ctx.fillStyle = 'rgba(255, 46, 151, 0.2)';
        this.ctx.fillRect(this.canvas.width - this.goalDepth, goalTop, this.goalDepth, this.goalSize);
        
        // Joueurs
        this.drawPlayer(this.player1);
        this.drawPlayer(this.player2);
        
        // Ballon
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ffffff';
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Scores
        this.ctx.font = 'bold 48px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        
        this.ctx.fillStyle = this.player1.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.player1.color;
        this.ctx.fillText(this.player1.score.toString(), this.canvas.width / 4, 60);
        
        this.ctx.fillStyle = this.player2.color;
        this.ctx.shadowColor = this.player2.color;
        this.ctx.fillText(this.player2.score.toString(), 3 * this.canvas.width / 4, 60);
        
        this.ctx.shadowBlur = 0;
        
        // Contrôles
        this.ctx.font = '14px Rajdhani, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('P1: WASD', 10, this.canvas.height - 10);
        this.ctx.textAlign = 'right';
        this.ctx.fillText('P2: Flèches', this.canvas.width - 10, this.canvas.height - 10);
    }
    
    drawPlayer(player) {
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = player.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = player.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    animate() {
        if (!this.gameActive) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    endGame() {
        this.gameActive = false;
        
        const finalScore = Math.max(this.player1.score, this.player2.score);
        window.gameOver(finalScore);
    }
    
    destroy() {
        this.gameActive = false;
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

