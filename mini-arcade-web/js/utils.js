/**
 * ========================================
 * UTILS.JS - Fonctions utilitaires partagées
 * ========================================
 * Gestion des scores, animations, sons, particules
 */

// ========== GESTION DES SCORES ==========

/**
 * Sauvegarde un score dans localStorage
 * @param {string} gameName - Nom du jeu
 * @param {number} score - Score à sauvegarder
 */
function saveScore(gameName, score) {
    const key = `best-${gameName}`;
    const currentBest = parseInt(localStorage.getItem(key) || '0');
    
    if (score > currentBest) {
        localStorage.setItem(key, score.toString());
        return true; // Nouveau record
    }
    return false;
}

/**
 * Récupère le meilleur score d'un jeu
 * @param {string} gameName - Nom du jeu
 * @returns {number} Meilleur score
 */
function getBestScore(gameName) {
    const key = `best-${gameName}`;
    return parseInt(localStorage.getItem(key) || '0');
}

/**
 * Met à jour l'affichage du score en temps réel
 * @param {number} score - Score actuel
 */
function updateScoreDisplay(score) {
    const scoreElement = document.getElementById('current-score');
    if (scoreElement) {
        scoreElement.textContent = score;
        // Animation de pulse lors de la mise à jour
        scoreElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
        }, 200);
    }
}

/**
 * Charge tous les meilleurs scores au menu
 */
function loadBestScores() {
    const games = ['reflex', 'snake', 'pong', 'clickrush'];
    games.forEach(game => {
        const scoreElement = document.getElementById(`best-${game}`);
        if (scoreElement) {
            scoreElement.textContent = getBestScore(game);
        }
    });
}

// ========== GESTION DES SONS ==========

/**
 * Joue un son
 * @param {string} soundId - ID de l'élément audio
 * @param {number} volume - Volume (0 à 1)
 */
function playSound(soundId, volume = 0.3) {
    const sound = document.getElementById(soundId);
    if (sound && sound.src) {
        sound.volume = volume;
        sound.currentTime = 0;
        sound.play().catch(e => console.log('Audio playback prevented:', e));
    }
}

/**
 * Arrête un son
 * @param {string} soundId - ID de l'élément audio
 */
function stopSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.pause();
        sound.currentTime = 0;
    }
}

// ========== ANIMATION DU CANVAS D'ÉTOILES ==========

class StarsBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.particles = [];
        this.shootingStars = [];
        
        this.resize();
        this.init();
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        // Créer des étoiles statiques
        for (let i = 0; i < 200; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01
            });
        }
        
        // Créer des particules flottantes
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1,
                color: this.randomColor()
            });
        }
    }
    
    randomColor() {
        const colors = [
            'rgba(0, 240, 255, 0.6)',    // Cyan
            'rgba(178, 75, 243, 0.6)',   // Purple
            'rgba(255, 46, 151, 0.6)',   // Pink
            'rgba(67, 97, 238, 0.6)'     // Blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    createShootingStar() {
        if (Math.random() < 0.01) { // 1% de chance par frame
            this.shootingStars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height / 2,
                vx: Math.random() * 3 + 2,
                vy: Math.random() * 2 + 1,
                length: Math.random() * 80 + 20,
                alpha: 1
            });
        }
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(5, 8, 17, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner les étoiles scintillantes
        this.stars.forEach(star => {
            star.alpha += (Math.random() - 0.5) * star.twinkleSpeed;
            star.alpha = Math.max(0.2, Math.min(1, star.alpha));
            
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = 'white';
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        // Dessiner les particules
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Rebond sur les bords
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        // Créer et dessiner les étoiles filantes
        this.createShootingStar();
        this.shootingStars = this.shootingStars.filter(star => {
            star.x += star.vx;
            star.y += star.vy;
            star.alpha -= 0.01;
            
            if (star.alpha <= 0) return false;
            
            const gradient = this.ctx.createLinearGradient(
                star.x, star.y,
                star.x - star.vx * 10, star.y - star.vy * 10
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(star.x - star.vx * 10, star.y - star.vy * 10);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            return true;
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    start() {
        this.animate();
    }
}

// ========== UTILITAIRES GÉNÉRAUX ==========

/**
 * Génère un nombre aléatoire entre min et max
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @returns {number} Nombre aléatoire
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Génère une couleur aléatoire parmi la palette néon
 * @returns {string} Code couleur
 */
function getRandomNeonColor() {
    const colors = [
        '#00f0ff',  // Cyan
        '#b24bf3',  // Purple
        '#ff2e97',  // Pink
        '#4361ee'   // Blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Ajoute une classe temporaire pour l'animation
 * @param {HTMLElement} element - Élément DOM
 * @param {string} className - Classe à ajouter
 * @param {number} duration - Durée en ms
 */
function addTemporaryClass(element, className, duration = 500) {
    element.classList.add(className);
    setTimeout(() => {
        element.classList.remove(className);
    }, duration);
}

/**
 * Crée une explosion de particules (effet visuel)
 * @param {number} x - Position X
 * @param {number} y - Position Y
 * @param {CanvasRenderingContext2D} ctx - Contexte canvas
 */
function createParticleExplosion(x, y, ctx) {
    const particles = [];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1,
            color: getRandomNeonColor()
        });
    }
    
    function animateParticles() {
        let allDead = true;
        
        particles.forEach(p => {
            if (p.life > 0) {
                allDead = false;
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravité
                p.life -= 0.02;
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;
            }
        });
        
        if (!allDead) {
            requestAnimationFrame(animateParticles);
        }
    }
    
    animateParticles();
}

/**
 * Attend un certain délai (promesse)
 * @param {number} ms - Délai en millisecondes
 * @returns {Promise}
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== EXPORTS (disponibles globalement) ==========
// Ces fonctions sont disponibles car le script est chargé avant les jeux

// Initialiser l'arrière-plan étoilé au chargement
let starsBackground;
document.addEventListener('DOMContentLoaded', () => {
    starsBackground = new StarsBackground('stars-canvas');
    starsBackground.start();
});

