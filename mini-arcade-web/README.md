# 🎮 Mini Arcade Universe 🌌

Bienvenue dans **Mini Arcade Universe**, une collection de mini-jeux web avec un design spatial néon futuriste !

## ✨ Fonctionnalités

- **Menu principal galaxie** avec étoiles animées, particules et effets de glow
- **4 mini-jeux complets** et jouables
- **Système de scores** sauvegardés dans localStorage
- **Effets visuels cosmiques** : néon, glow, transitions fluides, particules
- **Design responsive** et moderne
- **Contrôles intuitifs** au clavier et à la souris

## 🎯 Les Mini-Jeux

### ⚡ Reflex Game
Teste ta rapidité ! Clique sur la cible dès qu'elle apparaît. Plus tu es rapide, plus tu gagnes de points.
- 10 manches de réflexes
- Score basé sur le temps de réaction
- Pénalité pour les clics trop tôt

### 🐍 Snake
Le classique indémodable revisité avec un style cosmique !
- Contrôles : Flèches ou WASD
- Collecte les pommes pour grandir
- La vitesse augmente progressivement

### 🏓 Pong
Pong spatial contre une IA !
- Contrôles : Flèches ou WS
- Marque des points avant l'IA
- Système de rebond réaliste

### 👆 Click Rush
Clique le plus vite possible pendant 15 secondes !
- Système de combo pour plus de points
- Pénalité pour les clics manqués
- Affichage du CPS (Clics Par Seconde)

## 🚀 Installation & Lancement

### Méthode simple
1. Télécharge le projet
2. Ouvre `index.html` dans ton navigateur
3. C'est tout ! Joue et amuse-toi ! 🎉

### Serveur local (optionnel)
Pour une meilleure expérience, utilise un serveur local :

```bash
# Avec Python 3
cd mini-arcade-web
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server mini-arcade-web -p 8000
```

Puis ouvre http://localhost:8000 dans ton navigateur.

## 🎨 Design

Le projet utilise une palette de couleurs néon/cosmos :
- **Bleu cyan** (#00f0ff) : Accent principal
- **Violet** (#b24bf3) : Accent secondaire
- **Rose néon** (#ff2e97) : Highlights
- **Bleu nuit** (#0a0e27) : Fond

Polices :
- **Orbitron** : Titres et scores
- **Rajdhani** : Texte général

## 📁 Structure du Projet

```
mini-arcade-web/
├── index.html              # Page principale
├── style.css               # Styles CSS avec design cosmos
├── js/
│   ├── main.js            # Navigation et menu principal
│   ├── utils.js           # Fonctions partagées (scores, animations)
│   ├── ReflexGame.js      # Jeu de réflexes
│   ├── SnakeGame.js       # Jeu Snake
│   ├── PongGame.js        # Jeu Pong
│   └── ClickRush.js       # Jeu Click Rush
├── assets/
│   ├── images/            # Images (vide pour l'instant)
│   ├── sounds/            # Sons (vide pour l'instant)
│   └── fonts/             # Fonts (vide pour l'instant)
└── README.md
```

## 🔧 Technologies Utilisées

- **HTML5** avec Canvas API
- **CSS3** avec animations et transitions
- **JavaScript ES6+** (Classes, modules)
- **Google Fonts** (Orbitron, Rajdhani)
- **localStorage** pour la sauvegarde des scores

## 🎵 Sons (Optionnel)

Le projet est configuré pour supporter des sons. Pour les activer :
1. Ajoute tes fichiers audio dans `assets/sounds/`
2. Décommente les balises `<source>` dans `index.html`
3. Formats recommandés : MP3, OGG, WAV

Fichiers audio suggérés :
- `menu-music.mp3` : Musique d'ambiance du menu
- `game-music.mp3` : Musique de jeu
- `click.mp3` : Son de clic
- `success.mp3` : Son de succès
- `fail.mp3` : Son d'échec

## 🌟 Fonctionnalités Avancées

### Animations
- Étoiles scintillantes en arrière-plan
- Particules flottantes interactives
- Étoiles filantes aléatoires
- Effets de glow et transitions fluides

### Système de Scores
- Sauvegarde automatique du meilleur score
- Affichage en temps réel
- Système de records par jeu

### Responsive
- Interface adaptative
- Contrôles tactiles possibles (à étendre)

## 🛠️ Personnalisation

### Ajouter un nouveau jeu

1. Crée un nouveau fichier dans `js/` (ex: `MonJeu.js`)
2. Utilise cette structure de base :

```javascript
class MonJeu {
    constructor(canvas, htmlContainer) {
        this.canvas = canvas;
        this.htmlContainer = htmlContainer;
        // ... ta logique
    }
    
    start() {
        // Démarrer le jeu
    }
    
    destroy() {
        // Nettoyer les ressources
    }
}
```

3. Ajoute une carte dans `index.html` :

```html
<div class="game-card" data-game="monjeu">
    <div class="card-glow"></div>
    <div class="card-content">
        <div class="game-icon">🎯</div>
        <h3>Mon Jeu</h3>
        <p>Description</p>
        <div class="best-score">Meilleur : <span id="best-monjeu">0</span></div>
    </div>
</div>
```

4. Ajoute le case dans `main.js` :

```javascript
case 'monjeu':
    currentGameInstance = new MonJeu(gameCanvas, gameHtmlContainer);
    break;
```

## 🐛 Debug

Ouvre la console du navigateur (F12) pour voir les logs et messages de debug.

## 📝 License

Ce projet est libre d'utilisation pour un usage personnel et éducatif.

## 🎉 Crédits

Créé avec ❤️ et beaucoup de café ☕

**Technologies & Inspirations :**
- Google Fonts
- Canvas API
- Design inspiré de l'espace et du néon

---

**Amusez-vous bien dans l'univers de Mini Arcade ! 🚀✨**

