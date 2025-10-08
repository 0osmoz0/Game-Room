/**
 * ========================================
 * SNAKE GAME
 * ========================================
 * Le classique jeu du serpent, version cosmique !
 * Mange les pommes pour grandir et gagner des points
 */

class SnakeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration du canvas
        this.canvas.width = 600;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        // Configuration du jeu
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // État du jeu
        this.snake = [];
        this.food = { x: 0, y: 0 };
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameActive = false;
        this.speed = 100; // ms par frame
        this.gameLoop = null;
        
        // Couleurs néon
        this.colors = {
            snake: ['#00f0ff', '#0dd3e8', '#1ab7d1', '#279aba'],
            food: '#ff2e97',
            grid: 'rgba(0, 240, 255, 0.1)'
        };
        
        this.setupControls();
    }
    
    setupControls() {
        // Gestion du clavier
        this.keyHandler = (e) => {
            if (!this.gameActive) return;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    e.preventDefault();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }
    
    start() {
        this.gameActive = true;
        this.score = 0;
        this.speed = 100;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Initialiser le serpent au centre
        const centerX = Math.floor(this.tileCount / 2);
        const centerY = Math.floor(this.tileCount / 2);
        
        this.snake = [
            { x: centerX, y: centerY },
            { x: centerX - 1, y: centerY },
            { x: centerX - 2, y: centerY }
        ];
        
        this.spawnFood();
        window.updateGameScore(0);
        
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Appliquer la nouvelle direction
        this.direction = { ...this.nextDirection };
        
        // Calculer la nouvelle position de la tête
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Vérifier les collisions avec les murs
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.endGame();
            return;
        }
        
        // Vérifier les collisions avec soi-même
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.endGame();
                return;
            }
        }
        
        // Ajouter la nouvelle tête
        this.snake.unshift(head);
        
        // Vérifier si le serpent mange la nourriture
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            window.updateGameScore(this.score);
            this.spawnFood();
            playSound('success-sound', 0.2);
            
            // Augmenter la vitesse progressivement
            if (this.score % 50 === 0 && this.speed > 50) {
                this.speed -= 5;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            // Retirer la queue si pas de nourriture mangée
            this.snake.pop();
        }
        
        this.draw();
    }
    
    draw() {
        // Fond sombre avec effet dégradé
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(10, 14, 39, 0.95)');
        gradient.addColorStop(1, 'rgba(5, 8, 17, 0.95)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner la grille
        this.drawGrid();
        
        // Dessiner la nourriture avec effet de glow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.colors.food;
        this.ctx.fillStyle = this.colors.food;
        
        // Animation de pulsation pour la nourriture
        const pulse = Math.sin(Date.now() / 200) * 0.1 + 0.9;
        const foodSize = this.gridSize * pulse;
        const foodOffset = (this.gridSize - foodSize) / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            foodSize / 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // Dessiner le serpent
        this.snake.forEach((segment, index) => {
            // Dégradé de couleur du serpent
            const colorIndex = Math.min(index, this.colors.snake.length - 1);
            this.ctx.fillStyle = this.colors.snake[colorIndex];
            
            // Effet de glow pour la tête
            if (index === 0) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = this.colors.snake[0];
            }
            
            // Segments arrondis
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            const size = this.gridSize - 2;
            const radius = 5;
            
            this.ctx.beginPath();
            this.ctx.roundRect(x + 1, y + 1, size, size, radius);
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
            
            // Yeux pour la tête
            if (index === 0) {
                this.ctx.fillStyle = '#ffffff';
                const eyeSize = 3;
                const eyeOffset = 6;
                
                if (this.direction.x === 1) { // Droite
                    this.ctx.fillRect(x + this.gridSize - eyeOffset, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - eyeOffset, y + this.gridSize - 8, eyeSize, eyeSize);
                } else if (this.direction.x === -1) { // Gauche
                    this.ctx.fillRect(x + eyeOffset - 3, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + eyeOffset - 3, y + this.gridSize - 8, eyeSize, eyeSize);
                } else if (this.direction.y === 1) { // Bas
                    this.ctx.fillRect(x + 5, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - 8, y + this.gridSize - eyeOffset, eyeSize, eyeSize);
                } else if (this.direction.y === -1) { // Haut
                    this.ctx.fillRect(x + 5, y + eyeOffset - 3, eyeSize, eyeSize);
                    this.ctx.fillRect(x + this.gridSize - 8, y + eyeOffset - 3, eyeSize, eyeSize);
                }
            }
        });
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        // Lignes verticales
        for (let x = 0; x <= this.tileCount; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Lignes horizontales
        for (let y = 0; y <= this.tileCount; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    spawnFood() {
        let validPosition = false;
        
        while (!validPosition) {
            this.food = {
                x: randomInt(0, this.tileCount - 1),
                y: randomInt(0, this.tileCount - 1)
            };
            
            // Vérifier que la nourriture n'apparaît pas sur le serpent
            validPosition = true;
            for (let segment of this.snake) {
                if (segment.x === this.food.x && segment.y === this.food.y) {
                    validPosition = false;
                    break;
                }
            }
        }
    }
    
    endGame() {
        this.gameActive = false;
        clearInterval(this.gameLoop);
        
        // Effet de game over sur le canvas
        this.ctx.fillStyle = 'rgba(255, 46, 151, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        playSound('fail-sound', 0.3);
        
        setTimeout(() => {
            window.gameOver(this.score);
        }, 1000);
    }
    
    destroy() {
        this.gameActive = false;
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.keyHandler);
        
        // Nettoyer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Le canvas a une taille fixe, pas besoin de resize
    }
}

// Polyfill pour roundRect si nécessaire (pour les anciens navigateurs)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        this.beginPath();
        this.moveTo(x + radius, y);
        this.arcTo(x + width, y, x + width, y + height, radius);
        this.arcTo(x + width, y + height, x, y + height, radius);
        this.arcTo(x, y + height, x, y, radius);
        this.arcTo(x, y, x + width, y, radius);
        this.closePath();
        return this;
    };
}

