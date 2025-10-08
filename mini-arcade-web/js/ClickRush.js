/**
 * ========================================
 * CLICK RUSH GAME
 * ========================================
 * Clique le plus rapidement possible pendant 10 secondes !
 * Chaque clic rapporte des points, attention à ne pas cliquer à côté
 */

class ClickRushGame {
    constructor(htmlContainer) {
        this.htmlContainer = htmlContainer;
        this.score = 0;
        this.clicks = 0;
        this.misses = 0;
        this.duration = 15; // secondes
        this.timeLeft = this.duration;
        this.gameActive = false;
        this.timerInterval = null;
        
        this.init();
    }
    
    init() {
        this.htmlContainer.style.display = 'flex';
        this.htmlContainer.style.flexDirection = 'column';
        this.htmlContainer.style.alignItems = 'center';
        this.htmlContainer.style.justifyContent = 'center';
        this.htmlContainer.style.width = '100%';
        this.htmlContainer.style.height = '100%';
        
        this.createUI();
    }
    
    createUI() {
        this.htmlContainer.innerHTML = `
            <div style="text-align: center; margin-bottom: 2rem;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.8rem; color: #00f0ff; margin-bottom: 1rem;">
                    Clique le plus vite possible !
                </h3>
                <div style="display: flex; gap: 3rem; justify-content: center; margin-top: 1.5rem;">
                    <div style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.8);">
                        ⏱️ Temps: <span id="clickrush-timer" style="color: #ff2e97; font-family: 'Orbitron', sans-serif; font-size: 1.4rem;">15</span>s
                    </div>
                    <div style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.8);">
                        👆 Clics: <span id="clickrush-clicks" style="color: #b24bf3; font-family: 'Orbitron', sans-serif; font-size: 1.4rem;">0</span>
                    </div>
                </div>
            </div>
            
            <div id="clickrush-container" style="
                position: relative;
                width: 700px;
                height: 450px;
                background: rgba(10, 14, 39, 0.6);
                border: 3px solid #00f0ff;
                border-radius: 20px;
                box-shadow: 0 0 40px rgba(0, 240, 255, 0.6);
                overflow: hidden;
                cursor: crosshair;
            ">
                <div id="clickrush-target" style="
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #00f0ff, #b24bf3);
                    box-shadow: 0 0 30px rgba(0, 240, 255, 0.8);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 2rem;
                    font-family: 'Orbitron', sans-serif;
                    color: white;
                    font-weight: bold;
                    transition: transform 0.1s ease;
                ">
                    👆
                </div>
                
                <div id="clickrush-message" style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.5rem;
                    color: #00f0ff;
                    text-shadow: 0 0 20px rgba(0, 240, 255, 0.8);
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                ">
                    PRÊT ?
                </div>
            </div>
            
            <div style="margin-top: 2rem; font-size: 1rem; color: rgba(255, 255, 255, 0.6); max-width: 600px; text-align: center;">
                💡 Clique sur la cible ! Elle change de position à chaque clic. Les clics manqués ne comptent pas !
            </div>
        `;
        
        this.container = document.getElementById('clickrush-container');
        this.target = document.getElementById('clickrush-target');
        this.message = document.getElementById('clickrush-message');
        this.timerDisplay = document.getElementById('clickrush-timer');
        this.clicksDisplay = document.getElementById('clickrush-clicks');
        
        // Événements
        this.target.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onTargetClick();
        });
        
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container && this.gameActive) {
                this.onMiss();
            }
        });
        
        this.target.addEventListener('mouseenter', () => {
            if (this.gameActive) {
                this.target.style.transform = 'scale(1.1)';
            }
        });
        
        this.target.addEventListener('mouseleave', () => {
            this.target.style.transform = 'scale(1)';
        });
    }
    
    start() {
        this.gameActive = false;
        this.score = 0;
        this.clicks = 0;
        this.misses = 0;
        this.timeLeft = this.duration;
        
        window.updateGameScore(0);
        this.clicksDisplay.textContent = 0;
        this.timerDisplay.textContent = this.duration;
        
        // Countdown
        this.showMessage('3');
        playSound('click-sound', 0.3);
        
        setTimeout(() => {
            this.showMessage('2');
            playSound('click-sound', 0.3);
            
            setTimeout(() => {
                this.showMessage('1');
                playSound('click-sound', 0.3);
                
                setTimeout(() => {
                    this.showMessage('GO!');
                    playSound('success-sound', 0.4);
                    
                    setTimeout(() => {
                        this.message.style.opacity = '0';
                        this.startGame();
                    }, 500);
                }, 1000);
            }, 1000);
        }, 1000);
    }
    
    startGame() {
        this.gameActive = true;
        this.moveTarget();
        
        // Timer
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerDisplay.textContent = this.timeLeft;
            
            // Effet de couleur quand le temps est bientôt écoulé
            if (this.timeLeft <= 5) {
                this.timerDisplay.style.color = '#ff2e97';
                this.timerDisplay.style.textShadow = '0 0 10px rgba(255, 46, 151, 0.8)';
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    showMessage(text) {
        this.message.textContent = text;
        this.message.style.opacity = '1';
    }
    
    moveTarget() {
        if (!this.gameActive) return;
        
        const containerRect = this.container.getBoundingClientRect();
        const maxX = this.container.offsetWidth - this.target.offsetWidth;
        const maxY = this.container.offsetHeight - this.target.offsetHeight;
        
        const x = randomInt(0, maxX);
        const y = randomInt(0, maxY);
        
        this.target.style.left = x + 'px';
        this.target.style.top = y + 'px';
        
        // Changer la couleur aléatoirement
        const gradients = [
            'linear-gradient(135deg, #00f0ff, #b24bf3)',
            'linear-gradient(135deg, #ff2e97, #b24bf3)',
            'linear-gradient(135deg, #00f0ff, #ff2e97)',
            'linear-gradient(135deg, #4361ee, #b24bf3)'
        ];
        this.target.style.background = gradients[Math.floor(Math.random() * gradients.length)];
        
        // Animation d'apparition
        this.target.style.transform = 'scale(0)';
        setTimeout(() => {
            this.target.style.transition = 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            this.target.style.transform = 'scale(1)';
        }, 10);
    }
    
    onTargetClick() {
        if (!this.gameActive) return;
        
        this.clicks++;
        this.clicksDisplay.textContent = this.clicks;
        
        // Calcul du score basé sur la vitesse
        const basePoints = 10;
        let bonus = 0;
        
        // Bonus combo (clics consécutifs rapides)
        if (this.clicks % 5 === 0) {
            bonus = 50;
            this.showFloatingText('+50 COMBO!', this.target.offsetLeft, this.target.offsetTop, '#ff2e97');
        } else if (this.clicks % 3 === 0) {
            bonus = 20;
            this.showFloatingText('+20 BONUS!', this.target.offsetLeft, this.target.offsetTop, '#b24bf3');
        }
        
        const points = basePoints + bonus;
        this.score += points;
        window.updateGameScore(this.score);
        
        // Effet visuel
        this.createClickEffect(
            parseInt(this.target.style.left) + this.target.offsetWidth / 2,
            parseInt(this.target.style.top) + this.target.offsetHeight / 2
        );
        
        playSound('success-sound', 0.2);
        
        // Déplacer la cible
        this.moveTarget();
    }
    
    onMiss() {
        if (!this.gameActive) return;
        
        this.misses++;
        
        // Pénalité légère
        this.score = Math.max(0, this.score - 5);
        window.updateGameScore(this.score);
        
        playSound('fail-sound', 0.1);
        
        // Effet visuel de miss
        this.container.style.boxShadow = '0 0 40px rgba(255, 46, 151, 0.8)';
        setTimeout(() => {
            this.container.style.boxShadow = '0 0 40px rgba(0, 240, 255, 0.6)';
        }, 200);
    }
    
    createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        effect.style.width = '20px';
        effect.style.height = '20px';
        effect.style.borderRadius = '50%';
        effect.style.background = 'radial-gradient(circle, #ffffff, transparent)';
        effect.style.pointerEvents = 'none';
        effect.style.animation = 'expand-fade 0.5s ease-out';
        
        this.container.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 500);
    }
    
    showFloatingText(text, x, y, color) {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.style.position = 'absolute';
        floatingText.style.left = x + 'px';
        floatingText.style.top = y + 'px';
        floatingText.style.color = color;
        floatingText.style.fontFamily = 'Orbitron, sans-serif';
        floatingText.style.fontSize = '1.5rem';
        floatingText.style.fontWeight = 'bold';
        floatingText.style.pointerEvents = 'none';
        floatingText.style.textShadow = `0 0 10px ${color}`;
        floatingText.style.animation = 'float-up 1s ease-out';
        
        this.container.appendChild(floatingText);
        
        setTimeout(() => {
            floatingText.remove();
        }, 1000);
    }
    
    endGame() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        // Cacher la cible
        this.target.style.display = 'none';
        
        // Calcul du CPS (Clics Par Seconde)
        const cps = (this.clicks / this.duration).toFixed(2);
        
        this.showMessage(`Terminé! ${cps} CPS`);
        this.message.style.opacity = '1';
        
        playSound('success-sound', 0.4);
        
        setTimeout(() => {
            window.gameOver(this.score);
        }, 2000);
    }
    
    destroy() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        this.htmlContainer.innerHTML = '';
        this.htmlContainer.style.display = 'none';
    }
}

// Ajouter les animations CSS dynamiquement
if (!document.getElementById('clickrush-animations')) {
    const style = document.createElement('style');
    style.id = 'clickrush-animations';
    style.textContent = `
        @keyframes expand-fade {
            0% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(3);
                opacity: 0;
            }
        }
        
        @keyframes float-up {
            0% {
                transform: translateY(0);
                opacity: 1;
            }
            100% {
                transform: translateY(-50px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

