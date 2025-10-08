# 🎮 Mini Arcade

Un projet de mini-arcade en C++ utilisant SFML 2.6+ avec trois jeux classiques :
- **Reflex Game** : Testez vos réflexes en cliquant sur un carré qui devient vert
- **Snake Game** : Le serpent classique qui mange des pommes
- **Pong Game** : Le jeu de ping-pong à deux joueurs

## 📋 Prérequis

### Système d'exploitation
- Windows 10/11
- Linux (Ubuntu, Debian, Fedora, Arch, etc.)
- macOS (10.15+)

### Outils nécessaires
- **CMake** 3.16 ou supérieur
- **Compilateur C++17** :
  - Linux/macOS : GCC 7+ ou Clang 5+
  - Windows : MSVC 2019+ ou MinGW-w64

## 🔧 Installation des dépendances

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install build-essential cmake libsfml-dev
```

### Linux (Fedora)
```bash
sudo dnf install cmake gcc-c++ SFML-devel
```

### Linux (Arch)
```bash
sudo pacman -S cmake gcc sfml
```

### macOS
```bash
# Installer Homebrew si nécessaire : https://brew.sh
brew install cmake sfml
```

### Windows
Deux options :

**Option 1 : Automatique (recommandé)**
- CMake téléchargera automatiquement SFML lors de la compilation
- Aucune installation manuelle nécessaire !

**Option 2 : Installation manuelle avec vcpkg**
```powershell
# Dans PowerShell
git clone https://github.com/Microsoft/vcpkg.git
cd vcpkg
.\bootstrap-vcpkg.bat
.\vcpkg install sfml:x64-windows
```

## 🚀 Compilation

### Linux / macOS
```bash
cd MiniArcade
mkdir build
cd build
cmake ..
make
```

### Windows (avec Visual Studio)
```powershell
cd MiniArcade
mkdir build
cd build
cmake ..
cmake --build . --config Release
```

### Windows (avec MinGW)
```bash
cd MiniArcade
mkdir build
cd build
cmake -G "MinGW Makefiles" ..
mingw32-make
```

## ▶️ Exécution

### Linux / macOS
```bash
cd build
./MiniArcade
```

### Windows
```powershell
cd build
.\MiniArcade.exe
# ou
.\Release\MiniArcade.exe
```

## 🎯 Comment jouer

### Menu Principal
- **Flèches Haut/Bas** : Naviguer dans le menu
- **Entrée** : Sélectionner un jeu
- **Échap** : Quitter

### Reflex Game
1. Cliquez sur le carré gris pour commencer
2. Le carré devient rouge - **ATTENDEZ !**
3. Quand il devient vert - **CLIQUEZ VITE !**
4. Votre temps de réaction est affiché
5. **Échap** : Retour au menu

### Snake Game
- **Flèches directionnelles** : Contrôler le serpent
- Mangez les pommes rouges pour grandir
- Ne vous mordez pas et ne sortez pas de la grille !
- **Espace** : Recommencer (après Game Over)
- **Échap** : Retour au menu

### Pong Game
- **Joueur 1 (gauche)** : Touches **Z** (haut) / **S** (bas)
- **Joueur 2 (droite)** : **Flèches Haut/Bas**
- Premier à 5 points gagne !
- **Espace** : Recommencer (après victoire)
- **Échap** : Retour au menu

## 📁 Structure du projet

```
MiniArcade/
├── CMakeLists.txt           # Configuration CMake
├── README.md                # Ce fichier
├── src/
│   ├── main.cpp            # Point d'entrée
│   ├── Game.hpp            # Classe abstraite de base
│   ├── Menu.hpp / .cpp     # Menu principal
│   ├── ReflexGame.hpp / .cpp
│   ├── SnakeGame.hpp / .cpp
│   ├── PongGame.hpp / .cpp
│   └── utils/
│       ├── ResourceManager.hpp / .cpp  # Gestion des ressources
├── assets/
│   ├── font.ttf            # Police Roboto
│   ├── sounds/             # Sons (extensible)
│   └── images/             # Images (extensible)
└── build/                  # Dossier de compilation
```

## 🛠️ Fonctionnalités techniques

- **Architecture orientée objet** : Classe abstraite `Game` et polymorphisme
- **Gestion des ressources** : Pattern Singleton pour `ResourceManager`
- **Code cross-platform** : Fonctionne sur Windows, Linux et macOS
- **Standard C++17** : Code moderne avec RAII et smart pointers
- **SFML 2.6+** : Bibliothèque graphique performante
- **CMake** : Build system portable

## 🎨 Personnalisation

### Ajouter un nouveau jeu
1. Créez une classe héritant de `Game` dans `src/`
2. Implémentez la méthode virtuelle `run()`
3. Ajoutez le jeu dans `Menu.cpp` et `main.cpp`
4. Recompilez !

### Modifier les assets
- Remplacez `assets/font.ttf` par votre police préférée
- Ajoutez des sons dans `assets/sounds/`
- Ajoutez des images dans `assets/images/`

## 🐛 Résolution de problèmes

### Erreur : "Cannot find SFML"
- **Linux** : Installez `libsfml-dev`
- **macOS** : `brew install sfml`
- **Windows** : Laissez CMake télécharger automatiquement SFML

### Erreur : "Police non chargée"
- Vérifiez que `assets/font.ttf` existe
- Assurez-vous que le dossier `assets` est copié dans `build/`

### Erreur de compilation C++17
```bash
# Forcer C++17 explicitement
cmake -DCMAKE_CXX_STANDARD=17 ..
```

### Fenêtre qui se ferme immédiatement (Windows)
- Lancez depuis la console PowerShell ou CMD, pas en double-cliquant

## 📜 Licence

Projet éducatif - Libre d'utilisation et de modification.

Police **Roboto** : Apache License 2.0 (Google Fonts)

SFML : Zlib/PNG License

## 👨‍💻 Développement

### Compilation en mode Debug
```bash
cmake -DCMAKE_BUILD_TYPE=Debug ..
make
```

### Nettoyage complet
```bash
rm -rf build
mkdir build
cd build
cmake ..
make
```

## 🎁 Fonctionnalités bonus possibles

- [ ] Musique de fond dans le menu
- [ ] Effets sonores pour chaque jeu
- [ ] Sauvegarde des high scores dans un fichier
- [ ] Transitions fade-in/fade-out
- [ ] Mode IA pour Pong
- [ ] Niveaux de difficulté

## 📞 Support

Pour toute question ou problème :
1. Vérifiez que toutes les dépendances sont installées
2. Consultez la section "Résolution de problèmes"
3. Relancez la compilation depuis zéro

---

**Bon jeu ! 🎮**

