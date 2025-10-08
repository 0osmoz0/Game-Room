/**
 * ========================================
 * SOCKET CLIENT - Gestion WebSocket
 * ========================================
 * Client Socket.IO pour les jeux multijoueurs en ligne
 */

class SocketClient {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.roomId = null;
        this.playerNumber = null;
        this.opponentId = null;
        this.latency = 0;
        
        this.callbacks = {
            onReady: null,
            onWaiting: null,
            onOpponentMove: null,
            onOpponentAction: null,
            onOpponentDisconnected: null,
            onMatchEnded: null
        };
    }
    
    /**
     * Connecte au serveur WebSocket
     */
    connect() {
        if (this.socket) {
            console.log('Déjà connecté au serveur');
            return;
        }
        
        // Charger Socket.IO depuis CDN
        if (typeof io === 'undefined') {
            console.error('Socket.IO n\'est pas chargé !');
            return;
        }
        
        this.socket = io();
        
        this.socket.on('connect', () => {
            this.connected = true;
            console.log('✅ Connecté au serveur WebSocket:', this.socket.id);
            this.startLatencyCheck();
        });
        
        this.socket.on('disconnect', () => {
            this.connected = false;
            console.log('❌ Déconnecté du serveur');
        });
        
        this.socket.on('game-ready', (data) => {
            console.log('🎮 Partie prête !', data);
            this.roomId = data.roomId;
            this.playerNumber = data.playerNumber;
            this.opponentId = data.opponentId;
            
            if (this.callbacks.onReady) {
                this.callbacks.onReady(data);
            }
        });
        
        this.socket.on('waiting-for-opponent', (data) => {
            console.log('⏳ En attente d\'un adversaire...', data);
            if (this.callbacks.onWaiting) {
                this.callbacks.onWaiting(data);
            }
        });
        
        this.socket.on('opponent-move', (data) => {
            if (this.callbacks.onOpponentMove) {
                this.callbacks.onOpponentMove(data);
            }
        });
        
        this.socket.on('opponent-action', (data) => {
            if (this.callbacks.onOpponentAction) {
                this.callbacks.onOpponentAction(data);
            }
        });
        
        this.socket.on('opponent-disconnected', () => {
            console.log('❌ L\'adversaire s\'est déconnecté');
            if (this.callbacks.onOpponentDisconnected) {
                this.callbacks.onOpponentDisconnected();
            }
        });
        
        this.socket.on('match-ended', (data) => {
            console.log('🏁 Partie terminée', data);
            if (this.callbacks.onMatchEnded) {
                this.callbacks.onMatchEnded(data);
            }
        });
        
        // Latence
        this.socket.on('pong', () => {
            this.latency = Date.now() - this.pingTime;
        });
    }
    
    /**
     * Mesure la latence toutes les 2 secondes
     */
    startLatencyCheck() {
        setInterval(() => {
            if (this.connected) {
                this.pingTime = Date.now();
                this.socket.emit('ping');
            }
        }, 2000);
    }
    
    /**
     * Rejoindre une partie multijoueur
     */
    joinMultiplayer(gameType) {
        if (!this.connected) {
            console.error('Pas connecté au serveur !');
            return;
        }
        
        console.log(`🎮 Recherche d'une partie ${gameType}...`);
        this.socket.emit('join-multiplayer', { gameType });
    }
    
    /**
     * Annuler l'attente
     */
    cancelWaiting() {
        if (this.socket) {
            this.socket.emit('cancel-waiting');
        }
        this.resetRoom();
    }
    
    /**
     * Envoyer un mouvement
     */
    sendMove(position, direction, action = null) {
        if (this.socket && this.roomId) {
            this.socket.emit('player-move', {
                roomId: this.roomId,
                position,
                direction,
                action
            });
        }
    }
    
    /**
     * Envoyer une action de jeu
     */
    sendAction(action, actionData = {}) {
        if (this.socket && this.roomId) {
            this.socket.emit('game-action', {
                roomId: this.roomId,
                action,
                actionData
            });
        }
    }
    
    /**
     * Envoyer l'état complet du jeu (host seulement)
     */
    sendGameState(state) {
        if (this.socket && this.roomId && this.playerNumber === 1) {
            this.socket.emit('game-state', {
                roomId: this.roomId,
                state
            });
        }
    }
    
    /**
     * Signaler la fin de partie
     */
    sendGameOver(winnerId, score) {
        if (this.socket && this.roomId) {
            this.socket.emit('game-over', {
                roomId: this.roomId,
                winnerId,
                score
            });
        }
    }
    
    /**
     * Définir les callbacks
     */
    on(event, callback) {
        this.callbacks[event] = callback;
    }
    
    /**
     * Réinitialiser la room
     */
    resetRoom() {
        this.roomId = null;
        this.playerNumber = null;
        this.opponentId = null;
    }
    
    /**
     * Déconnexion
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connected = false;
        this.resetRoom();
    }
    
    /**
     * Obtenir la latence
     */
    getLatency() {
        return this.latency;
    }
}

// Instance globale
const socketClient = new SocketClient();

// Connecter automatiquement au chargement
window.addEventListener('DOMContentLoaded', () => {
    // Ne se connecte que si Socket.IO est disponible
    if (typeof io !== 'undefined') {
        socketClient.connect();
    }
});

