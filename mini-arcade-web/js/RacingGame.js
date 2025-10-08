/**
 * ========================================
 * RACING GAME (Course)
 * ========================================
 * Course de voiture en 3D isométrique !
 * Contrôles : Flèches gauche/droite
 */

class RacingGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.canvas.width = 600;
        this.canvas.height = 700;
        this.canvas.style.display = 'block';
        
        // Voiture du joueur
        this.car = {
            x: 250,
            y: 500,
            width: 40,
            height: 60,
            speed: 0,
            maxSpeed: 12,
            acceleration: 0.3,
            friction: 0.95,
            color: '#00f0ff'
        };
        
        // Route
        this.roadX = 150;
        this.roadWidth = 300;
        this.roadSpeed = 8;
        this.roadOffset = 0;
        
        // Obstacles (autres voitures)
        this.obstacles = [];
        this.obstacleSpawnTimer = 0;
        this.obstacleSpawnInterval = 80;
        
        // Jeu
        this.score = 0;
        this.distance = 0;
        this.gameActive = false;
        this.keys = {};
        
        this.setupControls();
    }
    
    setupControls() {
        this.keyDownHandler = (e) => {
            this.keys[e.key] = true;
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp'].includes(e.key)) {
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
        this.distance = 0;
        this.car.x = 250;
        this.car.y = 500;
        this.car.speed = 0;
        this.obstacles = [];
        this.obstacleSpawnTimer = 0;
        
        window.updateGameScore(0);
        this.animate();
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Contrôles
        if (this.keys['ArrowLeft']) {
            this.car.x -= 6;
        }
        if (this.keys['ArrowRight']) {
            this.car.x += 6;
        }
        
        // Limiter à la route
        this.car.x = Math.max(this.roadX + 10, Math.min(this.roadX + this.roadWidth - 10 - this.car.width, this.car.x));
        
        // Vitesse automatique
        this.car.speed = this.car.maxSpeed;
        
        // Défilement route
        this.roadOffset += this.car.speed;
        if (this.roadOffset > 40) {
            this.roadOffset = 0;
        }
        
        // Distance
        this.distance += this.car.speed / 10;
        this.score = Math.floor(this.distance);
        window.updateGameScore(this.score);
        
        // Spawn obstacles
        this.obstacleSpawnTimer++;
        if (this.obstacleSpawnTimer >= this.obstacleSpawnInterval) {
            this.spawnObstacle();
            this.obstacleSpawnTimer = 0;
            
            // Augmenter difficulté
            if (this.obstacleSpawnInterval > 40) {
                this.obstacleSpawnInterval -= 0.5;
            }
        }
        
        // Mouvement obstacles
        this.obstacles = this.obstacles.filter(obs => {
            obs.y += this.car.speed;
            
            // Collision
            if (this.checkCollision(this.car, obs)) {
                this.endGame();
                return false;
            }
            
            return obs.y < this.canvas.height + 100;
        });
    }
    
    spawnObstacle() {
        const lanes = [
            this.roadX + 30,
            this.roadX + this.roadWidth / 2 - 20,
            this.roadX + this.roadWidth - 70
        ];
        
        const lane = lanes[Math.floor(Math.random() * lanes.length)];
        const colors = ['#ff2e97', '#ffff00', '#ff8800', '#b24bf3'];
        
        this.obstacles.push({
            x: lane,
            y: -100,
            width: 40,
            height: 60,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    checkCollision(car, obs) {
        return car.x < obs.x + obs.width &&
               car.x + car.width > obs.x &&
               car.y < obs.y + obs.height &&
               car.y + car.height > obs.y;
    }
    
    draw() {
        // Fond
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(20, 20, 40, 0.95)');
        gradient.addColorStop(1, 'rgba(10, 14, 39, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Herbe
        this.ctx.fillStyle = 'rgba(0, 100, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.roadX, this.canvas.height);
        this.ctx.fillRect(this.roadX + this.roadWidth, 0, this.canvas.width - this.roadX - this.roadWidth, this.canvas.height);
        
        // Route
        this.ctx.fillStyle = 'rgba(60, 60, 60, 0.8)';
        this.ctx.fillRect(this.roadX, 0, this.roadWidth, this.canvas.height);
        
        // Lignes de route
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([30, 20]);
        
        for (let i = -1; i < 20; i++) {
            const y = i * 50 + this.roadOffset;
            
            // Ligne centrale
            this.ctx.beginPath();
            this.ctx.moveTo(this.roadX + this.roadWidth / 2, y);
            this.ctx.lineTo(this.roadX + this.roadWidth / 2, y + 30);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
        
        // Obstacles
        this.obstacles.forEach(obs => {
            this.drawCar(obs.x, obs.y, obs.width, obs.height, obs.color);
        });
        
        // Voiture joueur
        this.drawCar(this.car.x, this.car.y, this.car.width, this.car.height, this.car.color);
        
        // Score
        this.ctx.font = 'bold 32px Orbitron, sans-serif';
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.fillText('Distance: ' + this.score + 'm', this.canvas.width / 2, 50);
        this.ctx.shadowBlur = 0;
        
        // Instructions
        this.ctx.font = '16px Rajdhani, sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.fillText('← → pour se déplacer', this.canvas.width / 2, this.canvas.height - 20);
    }
    
    drawCar(x, y, width, height, color) {
        // Ombre
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x + 5, y + height + 3, width, 8);
        
        // Corps
        this.ctx.fillStyle = color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;
        this.ctx.fillRect(x, y, width, height);
        
        // Fenêtre
        this.ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        this.ctx.fillRect(x + 5, y + 10, width - 10, 20);
        
        // Roues
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x - 3, y + 10, 6, 15);
        this.ctx.fillRect(x + width - 3, y + 10, 6, 15);
        this.ctx.fillRect(x - 3, y + height - 25, 6, 15);
        this.ctx.fillRect(x + width - 3, y + height - 25, 6, 15);
        
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
        playSound('fail-sound', 0.3);
        
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

