/**
 * ========================================
 * MAIN.JS - Navigation et gestion du menu
 * ========================================
 * Gère le menu principal, la navigation entre les écrans,
 * et l'initialisation des jeux
 */

// ========== VARIABLES GLOBALES ==========
let currentGame = null;
let currentGameInstance = null;
let isOnlineMultiplayer = false;
let currentGameType = null;

// Éléments DOM
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const matchmakingScreen = document.getElementById('matchmaking-screen');
const gameCanvas = document.getElementById('game-canvas');
const gameHtmlContainer = document.getElementById('game-html-container');
const gameOverScreen = document.getElementById('game-over');
const currentGameTitle = document.getElementById('current-game-title');
const backBtn = document.getElementById('back-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const cancelMatchmakingBtn = document.getElementById('cancel-matchmaking-btn');

// ========== NAVIGATION ==========

/**
 * Affiche un écran et cache les autres
 * @param {string} screenName - 'menu', 'game' ou 'matchmaking'
 */
function showScreen(screenName) {
    // Cache tous les écrans
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Affiche l'écran demandé
    if (screenName === 'menu') {
        menuScreen.classList.add('active');
        stopSound('game-music');
        playSound('menu-music', 0.2);
    } else if (screenName === 'game') {
        gameScreen.classList.add('active');
        stopSound('menu-music');
        playSound('game-music', 0.2);
    } else if (screenName === 'matchmaking') {
        matchmakingScreen.classList.add('active');
    }
}

/**
 * Affiche l'écran de matchmaking
 * @param {string} gameType - Type de jeu
 * @param {string} gameName - Nom du jeu
 * @param {string} gameIcon - Icône du jeu
 */
function showMatchmaking(gameType, gameName, gameIcon) {
    currentGameType = gameType;
    
    // Mettre à jour l'interface
    document.getElementById('matchmaking-game-name').textContent = gameName;
    document.getElementById('matchmaking-game-icon').textContent = gameIcon;
    
    // Afficher l'écran
    showScreen('matchmaking');
    
    // Démarrer le matchmaking
    if (typeof socketClient !== 'undefined' && socketClient.connected) {
        socketClient.joinMultiplayer(gameType);
    } else {
        alert('❌ Pas de connexion au serveur ! Relance le serveur Node.js avec "npm start"');
        returnToMenu();
    }
}

/**
 * Lance un jeu
 * @param {string} gameName - Nom du jeu à lancer
 * @param {number} playerNumber - Numéro du joueur en multijoueur (1 ou 2), null pour solo
 */
function startGame(gameName, playerNumber = null) {
    currentGame = gameName;
    
    // Nettoyer l'instance précédente si elle existe
    if (currentGameInstance && typeof currentGameInstance.destroy === 'function') {
        currentGameInstance.destroy();
    }
    
    // Vider les containers
    gameHtmlContainer.innerHTML = '';
    
    // Cacher le game over
    gameOverScreen.classList.add('hidden');
    
    // Afficher l'écran de jeu
    showScreen('game');
    
    // Mettre à jour le titre
    const gameTitles = {
        'reflex': 'Reflex Game',
        'snake': 'Snake',
        'pong': 'Pong',
        'clickrush': 'Click Rush',
        'tetris': 'Tetris',
        'breakout': 'Breakout',
        'spaceinvaders': 'Space Invaders',
        'flappy': 'Flappy Bird',
        'hangman': 'Pendu',
        'racing': 'Racing',
        'tron': 'Tron - Light Cycles',
        'airhockey': 'Air Hockey',
        'tankbattle': 'Tank Battle',
        'tictactoe': 'Morpion',
        'connect4': 'Puissance 4',
        'soccer': 'Soccer'
    };
    currentGameTitle.textContent = gameTitles[gameName] || gameName;
    
    // Initialiser le score à 0
    updateScoreDisplay(0);
    
    // Lancer le jeu correspondant
    setTimeout(() => {
        switch(gameName) {
            case 'reflex':
                currentGameInstance = new ReflexGame(gameCanvas, gameHtmlContainer);
                break;
            case 'snake':
                currentGameInstance = new SnakeGame(gameCanvas);
                break;
            case 'pong':
                currentGameInstance = new PongGame(gameCanvas);
                break;
            case 'clickrush':
                currentGameInstance = new ClickRushGame(gameHtmlContainer);
                break;
            case 'tetris':
                currentGameInstance = new TetrisGame(gameCanvas);
                break;
            case 'breakout':
                currentGameInstance = new BreakoutGame(gameCanvas);
                break;
            case 'spaceinvaders':
                currentGameInstance = new SpaceInvadersGame(gameCanvas);
                break;
            case 'flappy':
                currentGameInstance = new FlappyGame(gameCanvas, gameHtmlContainer);
                break;
            case 'hangman':
                currentGameInstance = new HangmanGame(gameCanvas, gameHtmlContainer);
                break;
            case 'racing':
                currentGameInstance = new RacingGame(gameCanvas);
                break;
            case 'tron':
                currentGameInstance = new TronGame(gameCanvas, isOnlineMultiplayer, playerNumber);
                break;
            case 'airhockey':
                currentGameInstance = new AirHockeyGame(gameCanvas, isOnlineMultiplayer, playerNumber);
                break;
            case 'tankbattle':
                currentGameInstance = new TankBattleGame(gameCanvas, isOnlineMultiplayer, playerNumber);
                break;
            case 'tictactoe':
                currentGameInstance = new TicTacToeGame(gameCanvas, isOnlineMultiplayer, playerNumber);
                break;
            case 'connect4':
                currentGameInstance = new Connect4Game(gameCanvas, isOnlineMultiplayer, playerNumber);
                break;
            case 'soccer':
                currentGameInstance = new SoccerGame(gameCanvas, isOnlineMultiplayer, playerNumber);
                break;
            default:
                console.error('Jeu non reconnu:', gameName);
                returnToMenu();
        }
        
        if (currentGameInstance) {
            currentGameInstance.start();
        }
    }, 300); // Petit délai pour la transition
}

/**
 * Retourne au menu principal
 */
function returnToMenu() {
    // Détruire l'instance du jeu en cours
    if (currentGameInstance && typeof currentGameInstance.destroy === 'function') {
        currentGameInstance.destroy();
    }
    currentGameInstance = null;
    currentGame = null;
    
    // Retour au menu
    showScreen('menu');
    
    // Recharger les meilleurs scores
    loadBestScores();
    
    // Cacher le game over
    gameOverScreen.classList.add('hidden');
}

/**
 * Rejouer le jeu actuel
 */
function restartGame() {
    if (currentGame) {
        startGame(currentGame);
    }
}

/**
 * Affiche l'écran de game over
 * @param {number} finalScore - Score final
 */
function showGameOver(finalScore) {
    const finalScoreElement = document.getElementById('final-score');
    const bestScoreElement = document.getElementById('best-score-display');
    
    finalScoreElement.textContent = finalScore;
    
    // Vérifier et afficher le meilleur score
    const bestScore = getBestScore(currentGame);
    const isNewRecord = saveScore(currentGame, finalScore);
    
    bestScoreElement.textContent = Math.max(finalScore, bestScore);
    
    // Animation si nouveau record
    if (isNewRecord) {
        bestScoreElement.parentElement.classList.add('pulse-glow');
        playSound('success-sound', 0.5);
    }
    
    // Afficher l'écran de game over
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('fade-in');
}

// ========== ÉVÉNEMENTS ==========

// Au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Charger les meilleurs scores
    loadBestScores();
    
    // Afficher le menu
    showScreen('menu');
    
    // Démarrer la musique de menu (optionnel, commenté par défaut)
    // playSound('menu-music', 0.2);
    
    // Événements des cartes de jeu
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const gameName = card.getAttribute('data-game');
            const isMultiplayer = card.classList.contains('multiplayer');
            
            playSound('click-sound', 0.3);
            
            // Animation avant de lancer
            addTemporaryClass(card, 'shake', 300);
            
            setTimeout(() => {
                if (isMultiplayer) {
                    // Jeu multijoueur en ligne
                    const gameIcons = {
                        'tron': '🏍️',
                        'airhockey': '🏒',
                        'tankbattle': '🔫',
                        'tictactoe': '⭕',
                        'connect4': '🔴',
                        'soccer': '⚽'
                    };
                    const gameNames = {
                        'tron': 'Tron - Light Cycles',
                        'airhockey': 'Air Hockey',
                        'tankbattle': 'Tank Battle',
                        'tictactoe': 'Morpion',
                        'connect4': 'Puissance 4',
                        'soccer': 'Soccer'
                    };
                    
                    isOnlineMultiplayer = true;
                    showMatchmaking(gameName, gameNames[gameName], gameIcons[gameName]);
                } else {
                    // Jeu solo
                    isOnlineMultiplayer = false;
                    startGame(gameName);
                }
            }, 300);
        });
        
        // Effet de survol avec son (optionnel)
        card.addEventListener('mouseenter', () => {
            // playSound('hover-sound', 0.1);
        });
    });
    
    // Bouton retour au menu
    backBtn.addEventListener('click', () => {
        playSound('click-sound', 0.3);
        returnToMenu();
    });
    
    // Bouton rejouer
    restartBtn.addEventListener('click', () => {
        playSound('click-sound', 0.3);
        restartGame();
    });
    
    // Bouton menu depuis game over
    menuBtn.addEventListener('click', () => {
        playSound('click-sound', 0.3);
        returnToMenu();
    });
    
    // Bouton annuler matchmaking
    if (cancelMatchmakingBtn) {
        cancelMatchmakingBtn.addEventListener('click', () => {
            playSound('click-sound', 0.3);
            if (typeof socketClient !== 'undefined') {
                socketClient.cancelWaiting();
            }
            returnToMenu();
        });
    }
    
    // Gestion du clavier
    document.addEventListener('keydown', (e) => {
        // Échap pour retourner au menu
        if (e.key === 'Escape' && gameScreen.classList.contains('active')) {
            returnToMenu();
        }
        
        // Échap pour annuler le matchmaking
        if (e.key === 'Escape' && matchmakingScreen.classList.contains('active')) {
            if (typeof socketClient !== 'undefined') {
                socketClient.cancelWaiting();
            }
            returnToMenu();
        }
    });
    
    // ========== SOCKET.IO CALLBACKS ==========
    
    // Afficher la latence en temps réel
    setInterval(() => {
        if (typeof socketClient !== 'undefined') {
            const latencyDisplay = document.getElementById('latency-display');
            const connectionStatus = document.getElementById('connection-status');
            
            if (latencyDisplay) {
                latencyDisplay.textContent = socketClient.getLatency() + ' ms';
            }
            
            if (connectionStatus) {
                connectionStatus.style.color = socketClient.connected ? '#00ff00' : '#ff0000';
                connectionStatus.style.textShadow = socketClient.connected ? '0 0 10px #00ff00' : '0 0 10px #ff0000';
            }
        }
    }, 500);
    
    // Quand une partie est trouvée
    if (typeof socketClient !== 'undefined') {
        socketClient.on('onReady', (data) => {
            console.log('🎮 Partie trouvée !', data);
            playSound('success-sound', 0.5);
            
            // Lancer le jeu en mode multijoueur
            setTimeout(() => {
                startGame(currentGameType, data.playerNumber);
            }, 1000);
        });
        
        socketClient.on('onOpponentDisconnected', () => {
            alert('❌ Ton adversaire s\'est déconnecté !');
            returnToMenu();
        });
    }
});

// ========== SYSTÈME DE TRANSITIONS ==========

/**
 * Transition animée entre les écrans
 * @param {HTMLElement} fromScreen - Écran de départ
 * @param {HTMLElement} toScreen - Écran d'arrivée
 */
function transitionScreen(fromScreen, toScreen) {
    // Animation de sortie
    fromScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fromScreen.style.opacity = '0';
    fromScreen.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        fromScreen.classList.remove('active');
        fromScreen.style.transform = 'scale(1)';
        
        // Animation d'entrée
        toScreen.classList.add('active');
        toScreen.style.opacity = '0';
        toScreen.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            toScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            toScreen.style.opacity = '1';
            toScreen.style.transform = 'scale(1)';
        }, 50);
    }, 500);
}

// ========== EFFETS INTERACTIFS ==========

// Effet de particules au clic (optionnel)
document.addEventListener('click', (e) => {
    if (menuScreen.classList.contains('active')) {
        const canvas = document.getElementById('stars-canvas');
        const ctx = canvas.getContext('2d');
        createParticleExplosion(e.clientX, e.clientY, ctx);
    }
});

// ========== GESTION DU REDIMENSIONNEMENT ==========
window.addEventListener('resize', () => {
    // Redimensionner le canvas si un jeu est actif
    if (currentGameInstance && typeof currentGameInstance.resize === 'function') {
        currentGameInstance.resize();
    }
});

// ========== PRÉVENTION DE LA FERMETURE ACCIDENTELLE ==========
window.addEventListener('beforeunload', (e) => {
    if (currentGameInstance && gameScreen.classList.contains('active')) {
        e.preventDefault();
        e.returnValue = 'Êtes-vous sûr de vouloir quitter ? Votre progression sera perdue.';
        return e.returnValue;
    }
});

// ========== EXPORTS POUR LES JEUX ==========
// Ces fonctions sont accessibles depuis les jeux pour interagir avec le système

/**
 * Fonction appelée par les jeux pour signaler la fin
 * @param {number} score - Score final
 */
window.gameOver = function(score) {
    showGameOver(score);
};

/**
 * Fonction pour mettre à jour le score depuis un jeu
 * @param {number} score - Score actuel
 */
window.updateGameScore = function(score) {
    updateScoreDisplay(score);
};

console.log('%c🎮 Mini Arcade Universe 🌌', 'color: #00f0ff; font-size: 24px; font-weight: bold;');
console.log('%cSystème initialisé avec succès!', 'color: #b24bf3; font-size: 14px;');

