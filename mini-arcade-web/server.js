/**
 * ========================================
 * SERVEUR WEBSOCKET - MINI ARCADE UNIVERSE
 * ========================================
 * Serveur Node.js avec Socket.IO pour les jeux multijoueurs en ligne
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3006;

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname)));

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== GESTION DES ROOMS ==========
const rooms = new Map();
const waitingPlayers = new Map(); // Joueurs en attente par type de jeu

// Structure d'une room :
// {
//   id: 'room-id',
//   gameType: 'tron' | 'airhockey' | 'tankbattle',
//   players: [socket1, socket2],
//   state: {} // État du jeu synchronisé
// }

/**
 * Crée un ID unique pour une room
 */
function generateRoomId() {
    return 'room-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Trouve ou crée une room pour un joueur
 */
function findOrCreateRoom(socket, gameType) {
    // Chercher un joueur en attente pour ce type de jeu
    if (waitingPlayers.has(gameType)) {
        const waitingSocket = waitingPlayers.get(gameType);
        waitingPlayers.delete(gameType);
        
        // Créer une room avec les deux joueurs
        const roomId = generateRoomId();
        const room = {
            id: roomId,
            gameType: gameType,
            players: [waitingSocket, socket],
            state: {},
            startTime: Date.now()
        };
        
        rooms.set(roomId, room);
        
        // Les deux joueurs rejoignent la room Socket.IO
        waitingSocket.join(roomId);
        socket.join(roomId);
        
        // Assigner les rôles
        waitingSocket.emit('game-ready', {
            roomId: roomId,
            playerNumber: 1,
            opponentId: socket.id
        });
        
        socket.emit('game-ready', {
            roomId: roomId,
            playerNumber: 2,
            opponentId: waitingSocket.id
        });
        
        console.log(`✅ Room créée: ${roomId} pour ${gameType}`);
        console.log(`   Joueur 1: ${waitingSocket.id}`);
        console.log(`   Joueur 2: ${socket.id}`);
        
        return roomId;
    } else {
        // Mettre le joueur en attente
        waitingPlayers.set(gameType, socket);
        socket.emit('waiting-for-opponent', { gameType });
        console.log(`⏳ Joueur en attente: ${socket.id} pour ${gameType}`);
        return null;
    }
}

// ========== SOCKET.IO EVENTS ==========

io.on('connection', (socket) => {
    console.log(`🔌 Nouveau joueur connecté: ${socket.id}`);
    
    // Rejoindre une partie multijoueur
    socket.on('join-multiplayer', (data) => {
        const { gameType } = data;
        console.log(`🎮 ${socket.id} veut jouer à ${gameType}`);
        
        socket.gameType = gameType;
        findOrCreateRoom(socket, gameType);
    });
    
    // Annuler l'attente
    socket.on('cancel-waiting', () => {
        if (socket.gameType && waitingPlayers.get(socket.gameType) === socket) {
            waitingPlayers.delete(socket.gameType);
            console.log(`❌ ${socket.id} a annulé l'attente`);
        }
    });
    
    // Mouvement du joueur (synchronisation)
    socket.on('player-move', (data) => {
        const { roomId, position, direction, action } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            // Diffuser le mouvement à l'autre joueur
            socket.to(roomId).emit('opponent-move', {
                position,
                direction,
                action,
                timestamp: Date.now()
            });
        }
    });
    
    // État du jeu (synchronisation complète)
    socket.on('game-state', (data) => {
        const { roomId, state } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            room.state = state;
            socket.to(roomId).emit('sync-state', state);
        }
    });
    
    // Action de jeu (tir, etc.)
    socket.on('game-action', (data) => {
        const { roomId, action, actionData } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            socket.to(roomId).emit('opponent-action', {
                action,
                actionData,
                timestamp: Date.now()
            });
        }
    });
    
    // Fin de partie
    socket.on('game-over', (data) => {
        const { roomId, winnerId, score } = data;
        const room = rooms.get(roomId);
        
        if (room) {
            io.to(roomId).emit('match-ended', {
                winnerId,
                score,
                timestamp: Date.now()
            });
            
            // Nettoyer la room après un délai
            setTimeout(() => {
                rooms.delete(roomId);
                console.log(`🗑️  Room supprimée: ${roomId}`);
            }, 5000);
        }
    });
    
    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`🔴 Joueur déconnecté: ${socket.id}`);
        
        // Retirer des joueurs en attente
        for (let [gameType, waitingSocket] of waitingPlayers.entries()) {
            if (waitingSocket === socket) {
                waitingPlayers.delete(gameType);
                console.log(`   Retiré de l'attente: ${gameType}`);
            }
        }
        
        // Notifier l'autre joueur dans la room
        for (let [roomId, room] of rooms.entries()) {
            if (room.players.includes(socket)) {
                socket.to(roomId).emit('opponent-disconnected');
                rooms.delete(roomId);
                console.log(`   Room fermée suite à déconnexion: ${roomId}`);
            }
        }
    });
    
    // Ping/Pong pour mesurer la latence
    socket.on('ping', () => {
        socket.emit('pong');
    });
});

// ========== ROUTES API ==========

// Statistiques du serveur
app.get('/api/stats', (req, res) => {
    res.json({
        connectedPlayers: io.sockets.sockets.size,
        activeRooms: rooms.size,
        waitingPlayers: waitingPlayers.size,
        roomsList: Array.from(rooms.values()).map(room => ({
            id: room.id,
            gameType: room.gameType,
            players: room.players.length,
            uptime: Date.now() - room.startTime
        }))
    });
});

// Démarrage du serveur
server.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('🎮  MINI ARCADE UNIVERSE - SERVEUR MULTIJOUEUR  🌌');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    console.log(`🌐 Ouvre ton navigateur sur: http://localhost:${PORT}`);
    console.log(`📊 Stats du serveur: http://localhost:${PORT}/api/stats`);
    console.log('');
    console.log('Prêt à accepter des connexions WebSocket ! ✨');
    console.log('');
});

// Gestion des erreurs
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non gérée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée:', reason);
});

