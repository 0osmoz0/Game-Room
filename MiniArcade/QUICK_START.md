# 🚀 Démarrage Rapide - Mini Arcade

## ⚡ Compilation en 3 étapes

### Linux / macOS
```bash
./build.sh
cd build
./MiniArcade
```

### Windows
```powershell
# Double-cliquez sur build.bat
# OU dans PowerShell :
.\build.bat
cd build\Release
.\MiniArcade.exe
```

## 🎮 Contrôles

| Jeu | Contrôles |
|-----|-----------|
| **Menu** | ↑↓ Naviguer, ⏎ Sélectionner, ⎋ Quitter |
| **Reflex Game** | 🖱️ Cliquer sur le carré vert, ⎋ Menu |
| **Snake** | ↑↓←→ Déplacer, ⎋ Menu, ␣ Rejouer |
| **Pong** | J1: Z/S, J2: ↑↓, ⎋ Menu, ␣ Rejouer |

## 📦 Fichiers importants

- `build.sh` / `build.bat` - Scripts de compilation
- `CMakeLists.txt` - Configuration du projet
- `src/` - Code source C++
- `assets/font.ttf` - Police de caractères
- `highscores.txt` - Scores sauvegardés (créé automatiquement)

## 🔥 Fonctionnalités

✅ 3 mini-jeux complets
✅ Sauvegarde automatique des meilleurs scores
✅ Interface graphique soignée
✅ Navigation intuitive
✅ Cross-platform (Windows/Linux/macOS)

## ❓ Problème ?

**SFML non trouvé** → Installez avec `apt install libsfml-dev` (Linux) ou `brew install sfml` (macOS). Sur Windows, CMake le télécharge automatiquement.

**Police manquante** → Vérifiez que `assets/font.ttf` existe.

**Compilation échoue** → Consultez `README.md` pour les instructions détaillées.

---

**Amusez-vous bien ! 🎉**

