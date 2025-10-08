/**
 * ========================================
 * REFLEX GAME
 * ========================================
 * Un jeu de réflexes : clique sur la cible dès qu'elle apparaît !
 * Plus tu es rapide, plus tu gagnes de points
 */

class ReflexGame {
    constructor(canvas, htmlContainer) {
        this.canvas = canvas;
        this.htmlContainer = htmlContainer;
        this.score = 0;
        this.round = 0;
        this.maxRounds = 10;
        this.isWaiting = false;
        this.startTime = 0;
        this.reactionTimes = [];
        this.gameActive = false;
        
        // Configuration
        this.minDelay = 1000;  // Délai minimum avant apparition (ms)
        this.maxDelay = 4000;  // Délai maximum avant apparition (ms)
        this.targetSize = 80;
        
        this.init();
    }
    
    init() {
        // Cacher le canvas, utiliser le container HTML
        this.canvas.style.display = 'none';
        this.htmlContainer.style.display = 'flex';
        this.htmlContainer.style.flexDirection = 'column';
        this.htmlContainer.style.alignItems = 'center';
        this.htmlContainer.style.justifyContent = 'center';
        this.htmlContainer.style.width = '100%';
        this.htmlContainer.style.height = '100%';
        this.htmlContainer.style.position = 'relative';
        
        // Créer l'interface
        this.createUI();
    }
    
    createUI() {
        this.htmlContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; color: #00f0ff; margin-bottom: 1rem;">
                    Clique sur la cible dès qu'elle apparaît !
                </h3>
                <div style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.8);">
                    Manche: <span id="reflex-round">0</span> / ${this.maxRounds}
                </div>
                <div id="reflex-message" style="font-size: 1.5rem; color: #ff2e97; margin-top: 1rem; min-height: 2rem; font-weight: bold;">
                    Prêt ?
                </div>
            </div>
            <div id="reflex-game-area" style="
                position: relative;
                width: 600px;
                height: 400px;
                background: rgba(10, 14, 39, 0.6);
                border: 3px solid #00f0ff;
                border-radius: 20px;
                box-shadow: 0 0 40px rgba(0, 240, 255, 0.6);
                overflow: hidden;
            ">
                <div id="reflex-target" style="display: none;"></div>
            </div>
            <div style="margin-top: 2rem; font-size: 1rem; color: rgba(255, 255, 255, 0.6); max-width: 500px; text-align: center;">
                💡 Astuce: Ne clique pas trop tôt, sinon tu perds des points !
            </div>
        `;
        
        this.gameArea = document.getElementById('reflex-game-area');
        this.target = document.getElementById('reflex-target');
        this.roundDisplay = document.getElementById('reflex-round');
        this.messageDisplay = document.getElementById('reflex-message');
        
        // Style de la cible
        this.target.style.position = 'absolute';
        this.target.style.width = this.targetSize + 'px';
        this.target.style.height = this.targetSize + 'px';
        this.target.style.borderRadius = '50%';
        this.target.style.background = 'radial-gradient(circle, #ff2e97, #7209b7)';
        this.target.style.boxShadow = '0 0 30px rgba(255, 46, 151, 0.8)';
        this.target.style.cursor = 'pointer';
        this.target.style.transition = 'transform 0.1s ease';
        
        // Événements
        this.target.addEventListener('click', () => this.onTargetClick());
        this.gameArea.addEventListener('click', (e) => {
            if (e.target === this.gameArea && this.isWaiting) {
                this.onEarlyClick();
            }
        });
        
        this.target.addEventListener('mouseenter', () => {
            this.target.style.transform = 'scale(1.1)';
        });
        
        this.target.addEventListener('mouseleave', () => {
            this.target.style.transform = 'scale(1)';
        });
    }
    
    start() {
        this.gameActive = true;
        this.score = 0;
        this.round = 0;
        this.reactionTimes = [];
        window.updateGameScore(0);
        
        this.messageDisplay.textContent = 'Attends la cible...';
        this.messageDisplay.style.color = '#00f0ff';
        
        setTimeout(() => {
            this.nextRound();
        }, 1500);
    }
    
    nextRound() {
        if (!this.gameActive) return;
        
        if (this.round >= this.maxRounds) {
            this.endGame();
            return;
        }
        
        this.round++;
        this.roundDisplay.textContent = this.round;
        this.isWaiting = true;
        
        // Cacher la cible
        this.target.style.display = 'none';
        this.messageDisplay.textContent = 'Attends...';
        this.messageDisplay.style.color = '#00f0ff';
        
        // Délai aléatoire avant d'afficher la cible
        const delay = randomInt(this.minDelay, this.maxDelay);
        
        this.waitTimeout = setTimeout(() => {
            if (!this.gameActive) return;
            this.showTarget();
        }, delay);
    }
    
    showTarget() {
        if (!this.gameActive) return;
        
        // Position aléatoire
        const maxX = this.gameArea.offsetWidth - this.targetSize;
        const maxY = this.gameArea.offsetHeight - this.targetSize;
        
        const x = randomInt(0, maxX);
        const y = randomInt(0, maxY);
        
        this.target.style.left = x + 'px';
        this.target.style.top = y + 'px';
        this.target.style.display = 'block';
        
        // Animation d'apparition
        this.target.style.transform = 'scale(0)';
        setTimeout(() => {
            this.target.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.target.style.transform = 'scale(1)';
        }, 10);
        
        this.startTime = Date.now();
        this.isWaiting = false;
        this.messageDisplay.textContent = 'CLIQUE !';
        this.messageDisplay.style.color = '#ff2e97';
        
        // Timeout si pas de clic (3 secondes)
        this.targetTimeout = setTimeout(() => {
            if (this.target.style.display !== 'none') {
                this.onMiss();
            }
        }, 3000);
    }
    
    onTargetClick() {
        if (!this.gameActive || this.isWaiting) return;
        
        clearTimeout(this.targetTimeout);
        
        const reactionTime = Date.now() - this.startTime;
        this.reactionTimes.push(reactionTime);
        
        // Calcul du score (plus c'est rapide, plus c'est de points)
        let points = 0;
        if (reactionTime < 200) {
            points = 100; // Réflexes incroyables !
        } else if (reactionTime < 400) {
            points = 75;  // Très rapide
        } else if (reactionTime < 600) {
            points = 50;  // Rapide
        } else if (reactionTime < 1000) {
            points = 25;  // Correct
        } else {
            points = 10;  // Lent
        }
        
        this.score += points;
        window.updateGameScore(this.score);
        
        // Message de feedback
        if (reactionTime < 200) {
            this.messageDisplay.textContent = `⚡ INCROYABLE ! +${points} (${reactionTime}ms)`;
            this.messageDisplay.style.color = '#b24bf3';
        } else if (reactionTime < 400) {
            this.messageDisplay.textContent = `🔥 TRÈS RAPIDE ! +${points} (${reactionTime}ms)`;
            this.messageDisplay.style.color = '#00f0ff';
        } else {
            this.messageDisplay.textContent = `✓ Bien ! +${points} (${reactionTime}ms)`;
            this.messageDisplay.style.color = '#4361ee';
        }
        
        playSound('success-sound', 0.3);
        
        // Cacher la cible
        this.target.style.display = 'none';
        
        // Prochaine manche
        setTimeout(() => {
            this.nextRound();
        }, 1000);
    }
    
    onMiss() {
        if (!this.gameActive) return;
        
        this.messageDisplay.textContent = '❌ Trop lent !';
        this.messageDisplay.style.color = '#ff2e97';
        playSound('fail-sound', 0.3);
        
        this.target.style.display = 'none';
        
        setTimeout(() => {
            this.nextRound();
        }, 1000);
    }
    
    onEarlyClick() {
        if (!this.gameActive || !this.isWaiting) return;
        
        // Pénalité pour clic trop tôt
        this.score = Math.max(0, this.score - 20);
        window.updateGameScore(this.score);
        
        this.messageDisplay.textContent = '⚠️ Trop tôt ! -20 points';
        this.messageDisplay.style.color = '#ff2e97';
        
        playSound('fail-sound', 0.2);
        
        // Shake animation
        this.gameArea.classList.add('shake');
        setTimeout(() => {
            this.gameArea.classList.remove('shake');
        }, 500);
    }
    
    endGame() {
        this.gameActive = false;
        
        // Calculer le temps de réaction moyen
        const avgTime = this.reactionTimes.length > 0
            ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
            : 0;
        
        this.messageDisplay.textContent = `Terminé ! Temps moyen: ${avgTime}ms`;
        this.messageDisplay.style.color = '#b24bf3';
        
        // Afficher le game over
        setTimeout(() => {
            window.gameOver(this.score);
        }, 2000);
    }
    
    destroy() {
        this.gameActive = false;
        clearTimeout(this.waitTimeout);
        clearTimeout(this.targetTimeout);
        this.htmlContainer.innerHTML = '';
        this.htmlContainer.style.display = 'none';
        this.canvas.style.display = 'block';
    }
}

