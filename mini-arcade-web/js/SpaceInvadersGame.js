/**
 * ========================================
 * SPACE INVADERS GAME
 * ========================================
 * Le classique shooter spatial !
 * Contrôles : Flèches gauche/droite + Espace pour tirer
 */

class SpaceInvadersGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = 700;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        // Joueur
        this.player = {
            x: 0,
            y: 0,
            width: 40,
            height: 30,
            speed: 7,
            color: '#00f0ff'
        };
        
        // Aliens
        this.aliens = [];
        this.alienRows = 5;
        this.alienCols = 11;
        this.alienWidth = 30;
        this.alienHeight = 25;
        this.alienSpeed = 1;
        this.alienDirection = 1;
        this.alienDropDistance = 20;
        
        // Projectiles
        this.playerBullets = [];
        this.alienBullets = [];
        this.bulletSpeed = 10;
        
        // État
        this.score = 0;
        this.lives = 3;
        this.gameActive = false;
        this.keys = {};
        this.shootCooldown = 0;
        
        this.setupControls();
    }
    
    setupControls() {
        this.keyDownHandler = (e) => {
            this.keys[e.key] = true;
            if (['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
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
        this.lives = 3;
        this.alienSpeed = 1;
        
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - 60;
        
        this.playerBullets = [];
        this.alienBullets = [];
        
        this.initAliens();
        window.updateGameScore(0);
        this.animate();
    }
    
    initAliens() {
        this.aliens = [];
        this.alienDirection = 1;
        
        const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#b24bf3'];
        
        for (let row = 0; row < this.alienRows; row++) {
            for (let col = 0; col < this.alienCols; col++) {
                this.aliens.push({
                    x: col * 50 + 70,
                    y: row * 40 + 50,
                    width: this.alienWidth,
                    height: this.alienHeight,
                    alive: true,
                    color: colors[row],
                    points: (this.alienRows - row) * 10
                });
            }
        }
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Mouvement joueur
        if (this.keys['ArrowLeft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        
        // Tir
        if (this.shootCooldown > 0) this.shootCooldown--;
        
        if (this.keys[' '] && this.shootCooldown === 0) {
            this.playerBullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 15,
                color: '#00f0ff'
            });
            this.shootCooldown = 15;
            playSound('click-sound', 0.2);
        }
        
        // Mouvement aliens
        let touchEdge = false;
        this.aliens.forEach(alien => {
            if (!alien.alive) return;
            
            alien.x += this.alienSpeed * this.alienDirection;
            
            if (alien.x <= 0 || alien.x + alien.width >= this.canvas.width) {
                touchEdge = true;
            }
        });
        
        if (touchEdge) {
            this.alienDirection *= -1;
            this.aliens.forEach(alien => {
                alien.y += this.alienDropDistance;
            });
        }
        
        // Aliens tirent aléatoirement
        if (Math.random() < 0.01) {
            const aliveAliens = this.aliens.filter(a => a.alive);
            if (aliveAliens.length > 0) {
                const shooter = aliveAliens[Math.floor(Math.random() * aliveAliens.length)];
                this.alienBullets.push({
                    x: shooter.x + shooter.width / 2 - 2,
                    y: shooter.y + shooter.height,
                    width: 4,
                    height: 15,
                    color: '#ff2e97'
                });
            }
        }
        
        // Mouvement projectiles joueur
        this.playerBullets = this.playerBullets.filter(bullet => {
            bullet.y -= this.bulletSpeed;
            
            // Vérifier collision avec aliens
            for (let alien of this.aliens) {
                if (alien.alive &&
                    bullet.x < alien.x + alien.width &&
                    bullet.x + bullet.width > alien.x &&
                    bullet.y < alien.y + alien.height &&
                    bullet.y + bullet.height > alien.y) {
                    
                    alien.alive = false;
                    this.score += alien.points;
                    window.updateGameScore(this.score);
                    playSound('success-sound', 0.2);
                    return false;
                }
            }
            
            return bullet.y > 0;
        });
        
        // Mouvement projectiles aliens
        this.alienBullets = this.alienBullets.filter(bullet => {
            bullet.y += this.bulletSpeed;
            
            // Collision avec joueur
            if (bullet.x < this.player.x + this.player.width &&
                bullet.x + bullet.width > this.player.x &&
                bullet.y < this.player.y + this.player.height &&
                bullet.y + bullet.height > this.player.y) {
                
                this.lives--;
                playSound('fail-sound', 0.3);
                
                if (this.lives <= 0) {
                    this.endGame();
                }
                return false;
            }
            
            return bullet.y < this.canvas.height;
        });
        
        // Vérifier si aliens atteignent le bas
        for (let alien of this.aliens) {
            if (alien.alive && alien.y + alien.height >= this.player.y) {
                this.endGame();
                break;
            }
        }
        
        // Vérifier victoire
        if (this.aliens.every(a => !a.alive)) {
            this.score += 500;
            window.updateGameScore(this.score);
            playSound('success-sound', 0.5);
            
            setTimeout(() => {
                // Niveau suivant
                this.alienSpeed += 0.5;
                this.initAliens();
            }, 1000);
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
        
        // Aliens
        this.aliens.forEach(alien => {
            if (alien.alive) {
                this.ctx.fillStyle = alien.color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = alien.color;
                this.ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
                
                // Yeux
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(alien.x + 5, alien.y + 8, 6, 6);
                this.ctx.fillRect(alien.x + 19, alien.y + 8, 6, 6);
                
                this.ctx.shadowBlur = 0;
            }
        });
        
        // Joueur
        this.ctx.fillStyle = this.player.color;
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.player.color;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Projectiles
        [...this.playerBullets, ...this.alienBullets].forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        });
        
        // Vies
        this.ctx.font = 'bold 20px Orbitron, sans-serif';
        this.ctx.fillStyle = '#ff2e97';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('Vies: ' + '❤️'.repeat(this.lives), this.canvas.width - 20, 30);
        
        // Instructions
        this.ctx.font = '14px Rajdhani, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('← → Déplacer | Espace: Tirer', this.canvas.width / 2, this.canvas.height - 10);
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
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

