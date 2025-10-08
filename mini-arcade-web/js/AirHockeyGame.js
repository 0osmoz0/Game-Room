/**
 * ========================================
 * AIR HOCKEY GAME
 * ========================================
 * Air Hockey spatial en 2 joueurs !
 * Joueur 1: Souris | Joueur 2: WASD
 * Premier à 5 points gagne
 */

class AirHockeyGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        // Palet
        this.puck = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 12,
            vx: 0,
            vy: 0,
            maxSpeed: 15,
            friction: 0.98
        };
        
        // Palettes
        this.paddle1 = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 100,
            radius: 30,
            color: '#00f0ff',
            targetX: this.canvas.width / 2,
            targetY: this.canvas.height - 100,
            speed: 8,
            controls: 'keyboard' // WASD
        };
        
        this.paddle2 = {
            x: this.canvas.width / 2,
            y: 100,
            radius: 30,
            color: '#ff2e97',
            targetX: this.canvas.width / 2,
            targetY: 100,
            speed: 8,
            controls: 'mouse'
        };
        
        // Buts
        this.goalWidth = 200;
        this.goal1 = { // But en bas (joueur 1)
            x: this.canvas.width / 2 - this.goalWidth / 2,
            y: this.canvas.height - 5,
            width: this.goalWidth,
            height: 10
        };
        this.goal2 = { // But en haut (joueur 2)
            x: this.canvas.width / 2 - this.goalWidth / 2,
            y: -5,
            width: this.goalWidth,
            height: 10
        };
        
        // Scores
        this.score1 = 0;
        this.score2 = 0;
        this.maxScore = 5;
        
        // État
        this.gameActive = false;
        this.keys = {};
        this.mouseX = this.canvas.width / 2;
        this.mouseY = 100;
        
        // Particules
        this.particles = [];
        
        this.setupControls();
    }
    
    setupControls() {
        // Clavier pour joueur 1
        this.keyDownHandler = (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (['w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };
        
        this.keyUpHandler = (e) => {
            this.keys[e.key.toLowerCase()] = false;
        };
        
        // Souris pour joueur 2
        this.mouseMoveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
    }
    
    start() {
        this.score1 = 0;
        this.score2 = 0;
        this.gameActive = true;
        window.updateGameScore(0);
        
        this.resetPuck();
        this.animate();
    }
    
    resetPuck() {
        this.puck.x = this.canvas.width / 2;
        this.puck.y = this.canvas.height / 2;
        
        // Direction aléatoire
        const angle = (Math.random() * Math.PI / 2) + Math.PI / 4;
        const speed = 5;
        const direction = Math.random() < 0.5 ? 1 : -1;
        
        this.puck.vx = Math.cos(angle) * speed * (Math.random() < 0.5 ? 1 : -1);
        this.puck.vy = Math.sin(angle) * speed * direction;
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Contrôles joueur 1 (WASD)
        if (this.keys['w']) this.paddle1.targetY -= this.paddle1.speed;
        if (this.keys['s']) this.paddle1.targetY += this.paddle1.speed;
        if (this.keys['a']) this.paddle1.targetX -= this.paddle1.speed;
        if (this.keys['d']) this.paddle1.targetX += this.paddle1.speed;
        
        // Limiter la palette 1 à sa moitié du terrain
        this.paddle1.targetX = Math.max(this.paddle1.radius, Math.min(this.canvas.width - this.paddle1.radius, this.paddle1.targetX));
        this.paddle1.targetY = Math.max(this.canvas.height / 2 + 20, Math.min(this.canvas.height - this.paddle1.radius, this.paddle1.targetY));
        
        // Déplacement fluide
        this.paddle1.x += (this.paddle1.targetX - this.paddle1.x) * 0.3;
        this.paddle1.y += (this.paddle1.targetY - this.paddle1.y) * 0.3;
        
        // Contrôles joueur 2 (Souris)
        this.paddle2.targetX = this.mouseX;
        this.paddle2.targetY = this.mouseY;
        
        // Limiter la palette 2 à sa moitié du terrain
        this.paddle2.targetX = Math.max(this.paddle2.radius, Math.min(this.canvas.width - this.paddle2.radius, this.paddle2.targetX));
        this.paddle2.targetY = Math.max(this.paddle2.radius, Math.min(this.canvas.height / 2 - 20, this.paddle2.targetY));
        
        this.paddle2.x += (this.paddle2.targetX - this.paddle2.x) * 0.3;
        this.paddle2.y += (this.paddle2.targetY - this.paddle2.y) * 0.3;
        
        // Mouvement du palet
        this.puck.x += this.puck.vx;
        this.puck.y += this.puck.vy;
        
        // Friction
        this.puck.vx *= this.puck.friction;
        this.puck.vy *= this.puck.friction;
        
        // Collisions avec les murs latéraux
        if (this.puck.x - this.puck.radius < 0) {
            this.puck.x = this.puck.radius;
            this.puck.vx *= -0.8;
            this.createParticles(this.puck.x, this.puck.y, '#00f0ff');
            playSound('click-sound', 0.1);
        }
        if (this.puck.x + this.puck.radius > this.canvas.width) {
            this.puck.x = this.canvas.width - this.puck.radius;
            this.puck.vx *= -0.8;
            this.createParticles(this.puck.x, this.puck.y, '#00f0ff');
            playSound('click-sound', 0.1);
        }
        
        // Vérifier les buts
        if (this.puck.y - this.puck.radius < 0) {
            if (this.puck.x > this.goal2.x && this.puck.x < this.goal2.x + this.goal2.width) {
                this.score1++;
                this.onGoal(1);
            } else {
                this.puck.y = this.puck.radius;
                this.puck.vy *= -0.8;
            }
        }
        
        if (this.puck.y + this.puck.radius > this.canvas.height) {
            if (this.puck.x > this.goal1.x && this.puck.x < this.goal1.x + this.goal1.width) {
                this.score2++;
                this.onGoal(2);
            } else {
                this.puck.y = this.canvas.height - this.puck.radius;
                this.puck.vy *= -0.8;
            }
        }
        
        // Collisions avec les palettes
        this.checkPaddleCollision(this.paddle1);
        this.checkPaddleCollision(this.paddle2);
        
        // Limiter la vitesse
        const speed = Math.sqrt(this.puck.vx ** 2 + this.puck.vy ** 2);
        if (speed > this.puck.maxSpeed) {
            this.puck.vx = (this.puck.vx / speed) * this.puck.maxSpeed;
            this.puck.vy = (this.puck.vy / speed) * this.puck.maxSpeed;
        }
        
        // Mettre à jour les particules
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            return p.life > 0;
        });
    }
    
    checkPaddleCollision(paddle) {
        const dx = this.puck.x - paddle.x;
        const dy = this.puck.y - paddle.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance < this.puck.radius + paddle.radius) {
            // Calculer l'angle de collision
            const angle = Math.atan2(dy, dx);
            
            // Séparer les objets
            const overlap = this.puck.radius + paddle.radius - distance;
            this.puck.x += Math.cos(angle) * overlap;
            this.puck.y += Math.sin(angle) * overlap;
            
            // Calculer la nouvelle vélocité
            const speed = Math.sqrt(this.puck.vx ** 2 + this.puck.vy ** 2);
            const paddleSpeed = Math.sqrt((paddle.x - paddle.targetX) ** 2 + (paddle.y - paddle.targetY) ** 2);
            
            this.puck.vx = Math.cos(angle) * (speed + paddleSpeed * 0.5);
            this.puck.vy = Math.sin(angle) * (speed + paddleSpeed * 0.5);
            
            this.createParticles(this.puck.x, this.puck.y, paddle.color);
            playSound('success-sound', 0.2);
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
        
        // Ligne centrale
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([15, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height / 2);
        this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Cercle central
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, 80, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Buts
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
        this.ctx.fillRect(this.goal2.x, this.goal2.y, this.goal2.width, this.goal2.height);
        this.ctx.fillStyle = 'rgba(255, 46, 151, 0.3)';
        this.ctx.fillRect(this.goal1.x, this.goal1.y, this.goal1.width, this.goal1.height);
        
        // Scores
        this.ctx.font = 'bold 48px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        
        this.ctx.fillStyle = this.paddle2.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.paddle2.color;
        this.ctx.fillText(this.score2.toString(), this.canvas.width / 2, 80);
        
        this.ctx.fillStyle = this.paddle1.color;
        this.ctx.shadowColor = this.paddle1.color;
        this.ctx.fillText(this.score1.toString(), this.canvas.width / 2, this.canvas.height - 40);
        
        this.ctx.shadowBlur = 0;
        
        // Palettes
        this.drawPaddle(this.paddle1);
        this.drawPaddle(this.paddle2);
        
        // Palet
        this.ctx.beginPath();
        this.ctx.arc(this.puck.x, this.puck.y, this.puck.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = '#b24bf3';
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = '#b24bf3';
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
        
        // Instructions
        this.ctx.font = '14px Rajdhani, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('P1: WASD', 10, this.canvas.height - 10);
        this.ctx.textAlign = 'right';
        this.ctx.fillText('P2: Souris', this.canvas.width - 10, 20);
    }
    
    drawPaddle(paddle) {
        this.ctx.beginPath();
        this.ctx.arc(paddle.x, paddle.y, paddle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = paddle.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = paddle.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Centre blanc
        this.ctx.beginPath();
        this.ctx.arc(paddle.x, paddle.y, paddle.radius / 3, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 6; i++) {
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
    
    onGoal(player) {
        window.updateGameScore(this.score1 + this.score2);
        
        // Effet visuel
        const color = player === 1 ? this.paddle1.color : this.paddle2.color;
        for (let i = 0; i < 30; i++) {
            this.createParticles(this.puck.x, this.puck.y, color);
        }
        
        playSound('success-sound', 0.4);
        
        if (this.score1 >= this.maxScore || this.score2 >= this.maxScore) {
            setTimeout(() => this.endGame(), 1000);
        } else {
            setTimeout(() => this.resetPuck(), 1000);
        }
    }
    
    animate() {
        if (!this.gameActive) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    endGame() {
        this.gameActive = false;
        
        const winner = this.score1 > this.score2 ? 1 : 2;
        const finalScore = Math.max(this.score1, this.score2);
        
        window.gameOver(finalScore);
    }
    
    destroy() {
        this.gameActive = false;
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

