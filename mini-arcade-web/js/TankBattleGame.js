/**
 * ========================================
 * TANK BATTLE GAME
 * ========================================
 * Combat de tanks en 2 joueurs !
 * Joueur 1: WASD + Shift | Joueur 2: Flèches + Entrée
 * 3 vies chacun, le dernier en vie gagne !
 */

class TankBattleGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration
        this.canvas.width = 900;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        // Tanks
        this.tank1 = {
            x: 100,
            y: this.canvas.height / 2,
            angle: 0,
            speed: 3,
            rotationSpeed: 0.08,
            width: 40,
            height: 30,
            color: '#00f0ff',
            lives: 3,
            bullets: [],
            maxBullets: 3,
            shootCooldown: 0,
            controls: {
                up: 'w',
                down: 's',
                left: 'a',
                right: 'd',
                shoot: 'shift'
            }
        };
        
        this.tank2 = {
            x: this.canvas.width - 100,
            y: this.canvas.height / 2,
            angle: Math.PI,
            speed: 3,
            rotationSpeed: 0.08,
            width: 40,
            height: 30,
            color: '#ff2e97',
            lives: 3,
            bullets: [],
            maxBullets: 3,
            shootCooldown: 0,
            controls: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                shoot: 'Enter'
            }
        };
        
        // Obstacles
        this.obstacles = [
            { x: 300, y: 150, width: 80, height: 80 },
            { x: 520, y: 150, width: 80, height: 80 },
            { x: 300, y: 370, width: 80, height: 80 },
            { x: 520, y: 370, width: 80, height: 80 },
            { x: 410, y: 260, width: 80, height: 80 }
        ];
        
        // État
        this.gameActive = false;
        this.keys = {};
        this.particles = [];
        this.explosions = [];
        
        this.setupControls();
    }
    
    setupControls() {
        this.keyDownHandler = (e) => {
            this.keys[e.key] = true;
            this.keys[e.key.toLowerCase()] = true;
            
            if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift', 'Enter'].includes(e.key)) {
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
    
    start() {
        this.gameActive = true;
        
        // Reset tanks
        this.tank1.x = 100;
        this.tank1.y = this.canvas.height / 2;
        this.tank1.angle = 0;
        this.tank1.lives = 3;
        this.tank1.bullets = [];
        this.tank1.shootCooldown = 0;
        
        this.tank2.x = this.canvas.width - 100;
        this.tank2.y = this.canvas.height / 2;
        this.tank2.angle = Math.PI;
        this.tank2.lives = 3;
        this.tank2.bullets = [];
        this.tank2.shootCooldown = 0;
        
        window.updateGameScore(0);
        
        this.animate();
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Mettre à jour tank 1
        this.updateTank(this.tank1);
        
        // Mettre à jour tank 2
        this.updateTank(this.tank2);
        
        // Mettre à jour les balles
        this.updateBullets(this.tank1);
        this.updateBullets(this.tank2);
        
        // Vérifier les collisions balles-tanks
        this.checkBulletTankCollisions();
        
        // Mettre à jour les particules
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravité
            p.life -= 0.02;
            return p.life > 0;
        });
        
        // Mettre à jour les explosions
        this.explosions = this.explosions.filter(e => {
            e.radius += 3;
            e.alpha -= 0.05;
            return e.alpha > 0;
        });
        
        // Vérifier la fin du jeu
        if (this.tank1.lives <= 0 || this.tank2.lives <= 0) {
            setTimeout(() => this.endGame(), 2000);
        }
    }
    
    updateTank(tank) {
        // Cooldown de tir
        if (tank.shootCooldown > 0) tank.shootCooldown--;
        
        // Rotation
        if (this.keys[tank.controls.left]) {
            tank.angle -= tank.rotationSpeed;
        }
        if (this.keys[tank.controls.right]) {
            tank.angle += tank.rotationSpeed;
        }
        
        // Déplacement
        let newX = tank.x;
        let newY = tank.y;
        
        if (this.keys[tank.controls.up]) {
            newX += Math.cos(tank.angle) * tank.speed;
            newY += Math.sin(tank.angle) * tank.speed;
        }
        if (this.keys[tank.controls.down]) {
            newX -= Math.cos(tank.angle) * tank.speed;
            newY -= Math.sin(tank.angle) * tank.speed;
        }
        
        // Vérifier les collisions avec les murs
        if (newX > tank.width / 2 && newX < this.canvas.width - tank.width / 2 &&
            newY > tank.height / 2 && newY < this.canvas.height - tank.height / 2) {
            
            // Vérifier les collisions avec les obstacles
            let collision = false;
            for (let obs of this.obstacles) {
                if (this.checkTankObstacleCollision(newX, newY, tank, obs)) {
                    collision = true;
                    break;
                }
            }
            
            if (!collision) {
                tank.x = newX;
                tank.y = newY;
            }
        }
        
        // Tir
        if (this.keys[tank.controls.shoot] && tank.shootCooldown === 0 && tank.bullets.length < tank.maxBullets) {
            this.shoot(tank);
            tank.shootCooldown = 30; // 30 frames entre chaque tir
        }
    }
    
    checkTankObstacleCollision(x, y, tank, obstacle) {
        return x + tank.width / 2 > obstacle.x &&
               x - tank.width / 2 < obstacle.x + obstacle.width &&
               y + tank.height / 2 > obstacle.y &&
               y - tank.height / 2 < obstacle.y + obstacle.height;
    }
    
    shoot(tank) {
        const bulletSpeed = 8;
        const barrel = 25; // Distance du canon
        
        tank.bullets.push({
            x: tank.x + Math.cos(tank.angle) * barrel,
            y: tank.y + Math.sin(tank.angle) * barrel,
            vx: Math.cos(tank.angle) * bulletSpeed,
            vy: Math.sin(tank.angle) * bulletSpeed,
            radius: 5,
            color: tank.color
        });
        
        playSound('click-sound', 0.2);
        
        // Effet de recul visuel
        this.createParticles(
            tank.x + Math.cos(tank.angle) * barrel,
            tank.y + Math.sin(tank.angle) * barrel,
            tank.color,
            5
        );
    }
    
    updateBullets(tank) {
        tank.bullets = tank.bullets.filter(bullet => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            
            // Hors limites
            if (bullet.x < 0 || bullet.x > this.canvas.width ||
                bullet.y < 0 || bullet.y > this.canvas.height) {
                return false;
            }
            
            // Collision avec obstacles
            for (let obs of this.obstacles) {
                if (bullet.x > obs.x && bullet.x < obs.x + obs.width &&
                    bullet.y > obs.y && bullet.y < obs.y + obs.height) {
                    this.createExplosion(bullet.x, bullet.y, bullet.color);
                    return false;
                }
            }
            
            return true;
        });
    }
    
    checkBulletTankCollisions() {
        // Balles du tank 1 vs tank 2
        this.tank1.bullets = this.tank1.bullets.filter(bullet => {
            const dx = bullet.x - this.tank2.x;
            const dy = bullet.y - this.tank2.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            
            if (distance < this.tank2.width / 2) {
                this.tank2.lives--;
                this.createExplosion(bullet.x, bullet.y, '#ff2e97');
                window.updateGameScore(this.tank1.lives + this.tank2.lives);
                playSound('fail-sound', 0.3);
                return false;
            }
            return true;
        });
        
        // Balles du tank 2 vs tank 1
        this.tank2.bullets = this.tank2.bullets.filter(bullet => {
            const dx = bullet.x - this.tank1.x;
            const dy = bullet.y - this.tank1.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            
            if (distance < this.tank1.width / 2) {
                this.tank1.lives--;
                this.createExplosion(bullet.x, bullet.y, '#00f0ff');
                window.updateGameScore(this.tank1.lives + this.tank2.lives);
                playSound('fail-sound', 0.3);
                return false;
            }
            return true;
        });
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
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.canvas.width; x += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Obstacles
        this.ctx.fillStyle = 'rgba(100, 100, 100, 0.8)';
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
        this.ctx.lineWidth = 2;
        for (let obs of this.obstacles) {
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
        }
        
        // Vies
        this.drawLives(this.tank1, 20, 20);
        this.drawLives(this.tank2, this.canvas.width - 20, 20);
        
        // Tanks
        this.drawTank(this.tank1);
        this.drawTank(this.tank2);
        
        // Balles
        this.tank1.bullets.forEach(bullet => this.drawBullet(bullet));
        this.tank2.bullets.forEach(bullet => this.drawBullet(bullet));
        
        // Explosions
        this.explosions.forEach(exp => {
            this.ctx.beginPath();
            this.ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = exp.color;
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = exp.alpha;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1;
        });
        
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
        this.ctx.font = '12px Rajdhani, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('P1: WASD + Shift', 10, this.canvas.height - 10);
        this.ctx.textAlign = 'right';
        this.ctx.fillText('P2: Flèches + Entrée', this.canvas.width - 10, this.canvas.height - 10);
    }
    
    drawTank(tank) {
        this.ctx.save();
        this.ctx.translate(tank.x, tank.y);
        this.ctx.rotate(tank.angle);
        
        // Corps du tank
        this.ctx.fillStyle = tank.color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = tank.color;
        this.ctx.fillRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);
        
        // Canon
        this.ctx.fillRect(0, -3, 25, 6);
        
        // Tourelle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }
    
    drawBullet(bullet) {
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = bullet.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = bullet.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawLives(tank, x, y) {
        this.ctx.font = 'bold 16px Orbitron, sans-serif';
        this.ctx.fillStyle = tank.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = tank.color;
        
        if (x < this.canvas.width / 2) {
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`P1: ${'❤️'.repeat(tank.lives)}`, x, y);
        } else {
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`P2: ${'❤️'.repeat(tank.lives)}`, x, y);
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    createParticles(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                life: 1,
                color: color
            });
        }
    }
    
    createExplosion(x, y, color) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 5,
            alpha: 1,
            color: color
        });
        
        this.createParticles(x, y, color, 20);
    }
    
    animate() {
        if (!this.gameActive) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    endGame() {
        this.gameActive = false;
        
        const winner = this.tank1.lives > 0 ? 1 : 2;
        const finalScore = Math.max(this.tank1.lives, this.tank2.lives);
        
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
