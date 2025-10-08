/**
 * ========================================
 * HANGMAN GAME (Pendu)
 * ========================================
 * Jeu du pendu avec mots français
 * Clavier virtuel et dessin du pendu
 */

class HangmanGame {
    constructor(canvas, htmlContainer) {
        this.canvas = canvas;
        this.htmlContainer = htmlContainer;
        
        // Utiliser le container HTML
        this.canvas.style.display = 'none';
        this.htmlContainer.style.display = 'flex';
        this.htmlContainer.style.flexDirection = 'column';
        this.htmlContainer.style.alignItems = 'center';
        this.htmlContainer.style.justifyContent = 'center';
        this.htmlContainer.style.width = '100%';
        this.htmlContainer.style.height = '100%';
        
        // Mots à deviner
        this.words = [
            'ORDINATEUR', 'JAVASCRIPT', 'DEVELOPPEUR', 'PROGRAMMATION', 'ARCADE',
            'UNIVERS', 'GALAXIE', 'ETOILE', 'PLANETE', 'COSMOS',
            'AVENTURE', 'MISSION', 'ROCKET', 'SPATIAL', 'VAISSEAU',
            'INTELLIGENCE', 'ALGORITHME', 'FONCTION', 'VARIABLE', 'TABLEAU'
        ];
        
        this.word = '';
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        this.maxWrongs = 6;
        this.score = 0;
        this.gameActive = false;
        
        this.init();
    }
    
    init() {
        this.htmlContainer.innerHTML = `
            <div style="max-width: 800px; width: 100%; padding: 2rem; text-align: center;">
                <h2 style="font-family: 'Orbitron', sans-serif; font-size: 2rem; color: #00f0ff; margin-bottom: 2rem;">
                    JEU DU PENDU
                </h2>
                
                <div style="display: flex; justify-content: space-around; margin-bottom: 2rem;">
                    <div style="font-size: 1.2rem; color: #ff2e97;">
                        ❤️ Vies: <span id="hangman-lives">6</span>
                    </div>
                    <div style="font-size: 1.2rem; color: #00f0ff;">
                        🏆 Score: <span id="hangman-score">0</span>
                    </div>
                </div>
                
                <canvas id="hangman-canvas" width="300" height="300" style="
                    background: rgba(10, 14, 39, 0.6);
                    border: 2px solid #00f0ff;
                    border-radius: 10px;
                    margin-bottom: 2rem;
                "></canvas>
                
                <div id="word-display" style="
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.5rem;
                    letter-spacing: 1rem;
                    color: #00f0ff;
                    margin-bottom: 2rem;
                    min-height: 60px;
                "></div>
                
                <div id="keyboard" style="
                    display: grid;
                    grid-template-columns: repeat(9, 1fr);
                    gap: 0.5rem;
                    max-width: 600px;
                    margin: 0 auto;
                "></div>
                
                <div id="message" style="
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.5rem;
                    color: #b24bf3;
                    margin-top: 2rem;
                    min-height: 40px;
                "></div>
            </div>
        `;
        
        this.drawCanvas = document.getElementById('hangman-canvas');
        this.drawCtx = this.drawCanvas.getContext('2d');
        this.wordDisplay = document.getElementById('word-display');
        this.keyboard = document.getElementById('keyboard');
        this.livesDisplay = document.getElementById('hangman-lives');
        this.scoreDisplay = document.getElementById('hangman-score');
        this.messageDisplay = document.getElementById('message');
        
        this.createKeyboard();
    }
    
    createKeyboard() {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        letters.split('').forEach(letter => {
            const btn = document.createElement('button');
            btn.textContent = letter;
            btn.className = 'hangman-key';
            btn.style.cssText = `
                padding: 0.8rem;
                font-family: 'Orbitron', sans-serif;
                font-size: 1rem;
                background: rgba(0, 240, 255, 0.1);
                border: 2px solid #00f0ff;
                border-radius: 5px;
                color: #00f0ff;
                cursor: pointer;
                transition: all 0.3s ease;
            `;
            
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(0, 240, 255, 0.3)';
                btn.style.transform = 'scale(1.1)';
            });
            
            btn.addEventListener('mouseleave', () => {
                if (!btn.disabled) {
                    btn.style.background = 'rgba(0, 240, 255, 0.1)';
                    btn.style.transform = 'scale(1)';
                }
            });
            
            btn.addEventListener('click', () => this.guessLetter(letter, btn));
            
            this.keyboard.appendChild(btn);
        });
    }
    
    start() {
        this.gameActive = true;
        this.score = 0;
        this.newWord();
        window.updateGameScore(0);
    }
    
    newWord() {
        this.word = this.words[Math.floor(Math.random() * this.words.length)];
        this.guessedLetters = [];
        this.wrongGuesses = 0;
        
        // Reset keyboard
        document.querySelectorAll('.hangman-key').forEach(btn => {
            btn.disabled = false;
            btn.style.background = 'rgba(0, 240, 255, 0.1)';
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
        
        this.updateDisplay();
        this.drawHangman();
        this.livesDisplay.textContent = this.maxWrongs - this.wrongGuesses;
    }
    
    guessLetter(letter, btn) {
        if (!this.gameActive || this.guessedLetters.includes(letter)) return;
        
        this.guessedLetters.push(letter);
        btn.disabled = true;
        
        if (this.word.includes(letter)) {
            // Bonne lettre
            btn.style.background = 'rgba(0, 255, 0, 0.3)';
            btn.style.borderColor = '#00ff00';
            playSound('success-sound', 0.2);
            
            this.score += 10;
            window.updateGameScore(this.score);
        } else {
            // Mauvaise lettre
            btn.style.background = 'rgba(255, 0, 0, 0.3)';
            btn.style.borderColor = '#ff0000';
            btn.style.opacity = '0.5';
            playSound('fail-sound', 0.2);
            
            this.wrongGuesses++;
            this.livesDisplay.textContent = this.maxWrongs - this.wrongGuesses;
            this.drawHangman();
        }
        
        this.updateDisplay();
        this.checkWin();
    }
    
    updateDisplay() {
        let display = '';
        
        for (let letter of this.word) {
            if (this.guessedLetters.includes(letter)) {
                display += letter + ' ';
            } else {
                display += '_ ';
            }
        }
        
        this.wordDisplay.textContent = display.trim();
    }
    
    drawHangman() {
        const ctx = this.drawCtx;
        ctx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
        
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';
        
        // Base
        if (this.wrongGuesses >= 1) {
            ctx.beginPath();
            ctx.moveTo(50, 280);
            ctx.lineTo(250, 280);
            ctx.stroke();
        }
        
        // Poteau vertical
        if (this.wrongGuesses >= 2) {
            ctx.beginPath();
            ctx.moveTo(100, 280);
            ctx.lineTo(100, 50);
            ctx.stroke();
        }
        
        // Poteau horizontal
        if (this.wrongGuesses >= 3) {
            ctx.beginPath();
            ctx.moveTo(100, 50);
            ctx.lineTo(200, 50);
            ctx.stroke();
        }
        
        // Corde
        if (this.wrongGuesses >= 4) {
            ctx.beginPath();
            ctx.moveTo(200, 50);
            ctx.lineTo(200, 80);
            ctx.stroke();
        }
        
        ctx.strokeStyle = '#ff2e97';
        ctx.shadowColor = '#ff2e97';
        
        // Tête
        if (this.wrongGuesses >= 5) {
            ctx.beginPath();
            ctx.arc(200, 110, 30, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Corps
        if (this.wrongGuesses >= 6) {
            ctx.beginPath();
            ctx.moveTo(200, 140);
            ctx.lineTo(200, 220);
            ctx.stroke();
            
            // Bras
            ctx.beginPath();
            ctx.moveTo(200, 160);
            ctx.lineTo(170, 190);
            ctx.moveTo(200, 160);
            ctx.lineTo(230, 190);
            ctx.stroke();
            
            // Jambes
            ctx.beginPath();
            ctx.moveTo(200, 220);
            ctx.lineTo(170, 260);
            ctx.moveTo(200, 220);
            ctx.lineTo(230, 260);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0;
    }
    
    checkWin() {
        // Gagné
        if (this.word.split('').every(letter => this.guessedLetters.includes(letter))) {
            this.messageDisplay.textContent = '🎉 GAGNÉ ! Nouveau mot...';
            this.messageDisplay.style.color = '#00ff00';
            this.score += 50;
            window.updateGameScore(this.score);
            playSound('success-sound', 0.4);
            
            setTimeout(() => {
                this.messageDisplay.textContent = '';
                this.newWord();
            }, 2000);
            return;
        }
        
        // Perdu
        if (this.wrongGuesses >= this.maxWrongs) {
            this.messageDisplay.textContent = `💀 PERDU ! Le mot était: ${this.word}`;
            this.messageDisplay.style.color = '#ff0000';
            playSound('fail-sound', 0.4);
            
            setTimeout(() => {
                this.endGame();
            }, 3000);
        }
    }
    
    endGame() {
        this.gameActive = false;
        window.gameOver(this.score);
    }
    
    destroy() {
        this.gameActive = false;
        this.htmlContainer.innerHTML = '';
        this.htmlContainer.style.display = 'none';
        this.canvas.style.display = 'block';
    }
}

