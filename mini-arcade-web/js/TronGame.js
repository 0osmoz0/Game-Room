/**
 * ========================================
 * TRON GAME (Light Cycles)
 * ========================================
 * Course de motos lumineuses en 2 joueurs !
 * Ne touche pas les murs ni les traînées
 * Joueur 1: WASD | Joueur 2: Flèches
 */

class TronGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Configuration du canvas
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.display = 'block';
        
        // Configuration
        this.gridSize = 4;
        this.speed = 80; // ms par frame
        
        // Joueurs
        this.player1 = {
            x: 200,
            y: 300,
            direction: { x: 1, y: 0 },
            nextDirection: { x: 1, y: 0 },
            trail: [],
            color: '#00f0ff',
            alive: true,
            name: 'Joueur 1',
            controls: { up: 'w', down: 's', left: 'a', right: 'd' }
        };
        
        this.player2 = {
            x: 600,
            y: 300,
            direction: { x: -1, y: 0 },
            nextDirection: { x: -1, y: 0 },
            trail: [],
            color: '#ff2e97',
            alive: true,
            name: 'Joueur 2',
            controls: { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }
        };
        
        this.gameActive = false;
        this.gameLoop = null;
        this.winner = null;
        this.round = 0;
        this.scores = { p1: 0, p2: 0 };
        
        this.setupControls();
    }
    
    setupControls() {
        this.keyHandler = (e) => {
            if (!this.gameActive) return;
            
            const key = e.key.toLowerCase();
            
            // Joueur 1 (WASD)
            if (key === this.player1.controls.up && this.player1.direction.y === 0) {
                this.player1.nextDirection = { x: 0, y: -1 };
                e.preventDefault();
            } else if (key === this.player1.controls.down && this.player1.direction.y === 0) {
                this.player1.nextDirection = { x: 0, y: 1 };
                e.preventDefault();
            } else if (key === this.player1.controls.left && this.player1.direction.x === 0) {
                this.player1.nextDirection = { x: -1, y: 0 };
                e.preventDefault();
            } else if (key === this.player1.controls.right && this.player1.direction.x === 0) {
                this.player1.nextDirection = { x: 1, y: 0 };
                e.preventDefault();
            }
            
            // Joueur 2 (Flèches)
            if (e.key === this.player2.controls.up && this.player2.direction.y === 0) {
                this.player2.nextDirection = { x: 0, y: -1 };
                e.preventDefault();
            } else if (e.key === this.player2.controls.down && this.player2.direction.y === 0) {
                this.player2.nextDirection = { x: 0, y: 1 };
                e.preventDefault();
            } else if (e.key === this.player2.controls.left && this.player2.direction.x === 0) {
                this.player2.nextDirection = { x: -1, y: 0 };
                e.preventDefault();
            } else if (e.key === this.player2.controls.right && this.player2.direction.x === 0) {
                this.player2.nextDirection = { x: 1, y: 0 };
                e.preventDefault();
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }
    
    start() {
        this.round = 0;
        this.scores = { p1: 0, p2: 0 };
        this.startRound();
    }
    
    startRound() {
        this.round++;
        this.gameActive = true;
        this.winner = null;
        
        // Réinitialiser les joueurs
        this.player1.x = 200;
        this.player1.y = 300;
        this.player1.direction = { x: 1, y: 0 };
        this.player1.nextDirection = { x: 1, y: 0 };
        this.player1.trail = [{ x: 200, y: 300 }];
        this.player1.alive = true;
        
        this.player2.x = 600;
        this.player2.y = 300;
        this.player2.direction = { x: -1, y: 0 };
        this.player2.nextDirection = { x: -1, y: 0 };
        this.player2.trail = [{ x: 600, y: 300 }];
        this.player2.alive = true;
        
        // Score affiché = victoires
        window.updateGameScore(this.scores.p1 + this.scores.p2);
        
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }
    
    update() {
        if (!this.gameActive) return;
        
        // Mettre à jour les directions
        this.player1.direction = { ...this.player1.nextDirection };
        this.player2.direction = { ...this.player2.nextDirection };
        
        // Déplacer les joueurs
        if (this.player1.alive) {
            this.player1.x += this.player1.direction.x * this.gridSize;
            this.player1.y += this.player1.direction.y * this.gridSize;
            this.player1.trail.push({ x: this.player1.x, y: this.player1.y });
        }
        
        if (this.player2.alive) {
            this.player2.x += this.player2.direction.x * this.gridSize;
            this.player2.y += this.player2.direction.y * this.gridSize;
            this.player2.trail.push({ x: this.player2.x, y: this.player2.y });
        }
        
        // Vérifier les collisions
        this.checkCollisions();
        
        this.draw();
        
        // Vérifier la fin du round
        if (!this.player1.alive || !this.player2.alive) {
            this.endRound();
        }
    }
    
    checkCollisions() {
        // Collision avec les murs
        if (this.player1.alive) {
            if (this.player1.x < 0 || this.player1.x >= this.canvas.width ||
                this.player1.y < 0 || this.player1.y >= this.canvas.height) {
                this.player1.alive = false;
            }
        }
        
        if (this.player2.alive) {
            if (this.player2.x < 0 || this.player2.x >= this.canvas.width ||
                this.player2.y < 0 || this.player2.y >= this.canvas.height) {
                this.player2.alive = false;
            }
        }
        
        // Collision avec les traînées (sauf la position actuelle)
        if (this.player1.alive) {
            // Traînée du joueur 1
            for (let i = 0; i < this.player1.trail.length - 1; i++) {
                if (this.player1.x === this.player1.trail[i].x && 
                    this.player1.y === this.player1.trail[i].y) {
                    this.player1.alive = false;
                    break;
                }
            }
            // Traînée du joueur 2
            for (let point of this.player2.trail) {
                if (this.player1.x === point.x && this.player1.y === point.y) {
                    this.player1.alive = false;
                    break;
                }
            }
        }
        
        if (this.player2.alive) {
            // Traînée du joueur 1
            for (let point of this.player1.trail) {
                if (this.player2.x === point.x && this.player2.y === point.y) {
                    this.player2.alive = false;
                    break;
                }
            }
            // Traînée du joueur 2
            for (let i = 0; i < this.player2.trail.length - 1; i++) {
                if (this.player2.x === this.player2.trail[i].x && 
                    this.player2.y === this.player2.trail[i].y) {
                    this.player2.alive = false;
                    break;
                }
            }
        }
    }
    
    draw() {
        // Fond sombre
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
        for (let x = 0; x < this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Scores
        this.ctx.font = 'bold 24px Orbitron, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillStyle = this.player1.color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.player1.color;
        this.ctx.fillText(`P1: ${this.scores.p1}`, 20, 30);
        
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = this.player2.color;
        this.ctx.shadowColor = this.player2.color;
        this.ctx.fillText(`P2: ${this.scores.p2}`, this.canvas.width - 20, 30);
        
        this.ctx.shadowBlur = 0;
        
        // Traînées
        this.drawTrail(this.player1);
        this.drawTrail(this.player2);
        
        // Têtes des joueurs
        if (this.player1.alive) {
            this.drawHead(this.player1);
        }
        if (this.player2.alive) {
            this.drawHead(this.player2);
        }
    }
    
    drawTrail(player) {
        if (player.trail.length < 2) return;
        
        this.ctx.strokeStyle = player.color;
        this.ctx.lineWidth = this.gridSize;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = player.color;
        this.ctx.lineCap = 'square';
        
        this.ctx.beginPath();
        this.ctx.moveTo(player.trail[0].x, player.trail[0].y);
        
        for (let i = 1; i < player.trail.length; i++) {
            this.ctx.lineTo(player.trail[i].x, player.trail[i].y);
        }
        
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawHead(player) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = player.color;
        this.ctx.fillRect(
            player.x - this.gridSize / 2,
            player.y - this.gridSize / 2,
            this.gridSize,
            this.gridSize
        );
        this.ctx.shadowBlur = 0;
    }
    
    endRound() {
        clearInterval(this.gameLoop);
        this.gameActive = false;
        
        // Déterminer le gagnant
        if (!this.player1.alive && !this.player2.alive) {
            this.winner = 'draw';
        } else if (!this.player1.alive) {
            this.winner = 'p2';
            this.scores.p2++;
        } else {
            this.winner = 'p1';
            this.scores.p1++;
        }
        
        window.updateGameScore(this.scores.p1 + this.scores.p2);
        
        // Afficher le message
        this.ctx.fillStyle = 'rgba(5, 8, 17, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.font = 'bold 48px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        
        if (this.winner === 'draw') {
            this.ctx.fillStyle = '#b24bf3';
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = '#b24bf3';
            this.ctx.fillText('ÉGALITÉ !', this.canvas.width / 2, this.canvas.height / 2);
        } else {
            const winnerColor = this.winner === 'p1' ? this.player1.color : this.player2.color;
            const winnerName = this.winner === 'p1' ? 'JOUEUR 1' : 'JOUEUR 2';
            this.ctx.fillStyle = winnerColor;
            this.ctx.shadowBlur = 30;
            this.ctx.shadowColor = winnerColor;
            this.ctx.fillText(`${winnerName} GAGNE !`, this.canvas.width / 2, this.canvas.height / 2);
        }
        
        this.ctx.shadowBlur = 0;
        
        playSound(this.winner === 'draw' ? 'click-sound' : 'success-sound', 0.3);
        
        // Vérifier si on atteint 3 victoires
        if (this.scores.p1 >= 3 || this.scores.p2 >= 3) {
            setTimeout(() => {
                this.endGame();
            }, 2000);
        } else {
            setTimeout(() => {
                this.startRound();
            }, 2000);
        }
    }
    
    endGame() {
        const finalWinner = this.scores.p1 > this.scores.p2 ? 'JOUEUR 1' : 'JOUEUR 2';
        const finalScore = Math.max(this.scores.p1, this.scores.p2);
        
        window.gameOver(finalScore);
    }
    
    destroy() {
        this.gameActive = false;
        clearInterval(this.gameLoop);
        document.removeEventListener('keydown', this.keyHandler);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    resize() {
        // Taille fixe
    }
}

