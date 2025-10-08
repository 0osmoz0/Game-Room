# 🚀 Installation - Mini Arcade Universe

Guide d'installation pour le mode **multijoueur en ligne** avec WebSocket.

## 📋 Prérequis

- **Node.js** (v14 ou supérieur) - [Télécharger ici](https://nodejs.org/)
- Un navigateur moderne (Chrome, Firefox, Edge, Safari)

## ⚡ Installation Rapide

### 1. Installer les dépendances

```bash
cd mini-arcade-web
npm install
```

Cela installera automatiquement :
- `express` - Serveur web
- `socket.io` - WebSocket pour le multijoueur en ligne
- `nodemon` - Rechargement automatique (dev)

### 2. Lancer le serveur

```bash
npm start
```

Ou en mode développement (auto-reload):
```bash
npm run dev
```

### 3. Ouvrir le jeu

Ouvre ton navigateur sur :
```
http://localhost:3000
```

## 🎮 Comment jouer

### Jeux Solo (fonctionnent immédiatement)
- ⚡ **Reflex Game**
- 🐍 **Snake**
- 🏓 **Pong**
- 👆 **Click Rush**

### Jeux Multijoueurs EN LIGNE (nécessitent le serveur Node.js)
- 🏍️ **Tron** - Course de motos lumineuses
- 🏒 **Air Hockey** - Hockey spatial
- 🔫 **Tank Battle** - Combat de tanks

## 🌐 Mode Multijoueur en Ligne

1. **Lance le serveur** avec `npm start`
2. **Clique sur un jeu multijoueur** (badge violet "👥 Multijoueur")
3. **Attends un adversaire** - Le système de matchmaking te trouvera un joueur
4. **Joue !** - Une fois les 2 joueurs connectés, la partie commence

### Jouer avec un ami

Option 1 : **Même réseau local**
- Trouve ton IP locale : `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
- Partage l'URL : `http://TON_IP:3000`
- Ton ami se connecte et vous serez matchés

Option 2 : **Internet (avancé)**
- Utilise ngrok ou un service similaire
- Expose le port 3000 publiquement
- Partage l'URL générée

## 🛠️ Dépannage

### Le serveur ne démarre pas
```bash
# Vérifie que Node.js est installé
node --version

# Réinstalle les dépendances
rm -rf node_modules
npm install
```

### Port 3000 déjà utilisé
Modifie le port dans `server.js` :
```javascript
const PORT = process.env.PORT || 3000; // Change 3000
```

### Pas de connexion WebSocket
1. Vérifie que le serveur Node.js est lancé
2. Regarde la console du navigateur (F12)
3. Vérifie qu'il n'y a pas de bloqueur de popup/script

## 📊 Statistiques du serveur

Consulte les stats en direct :
```
http://localhost:3000/api/stats
```

Affiche :
- Joueurs connectés
- Rooms actives
- Joueurs en attente

## 🎯 Mode de développement

```bash
# Lancer avec nodemon (auto-reload)
npm run dev

# Le serveur redémarre automatiquement quand tu modifies le code
```

## 🔧 Architecture

```
Client (Navigateur) <----WebSocket----> Serveur Node.js

Jeu 1 (Joueur 1) ──┐
                    ├──> Room ──> Synchronisation
Jeu 2 (Joueur 2) ──┘
```

- **Socket.IO** gère les connexions temps réel
- **Matchmaking automatique** : associe 2 joueurs
- **Rooms** : chaque partie a sa propre room isolée
- **Synchronisation** : les mouvements sont envoyés en temps réel

## ✨ Prochaines étapes

Pour aller plus loin :
- Déployer sur Heroku/Vercel/Railway
- Ajouter un système de classement
- Créer un chat en jeu
- Ajouter plus de jeux multijoueurs !

---

**Besoin d'aide ?** Ouvre un ticket sur GitHub ou contacte-nous ! 🚀

