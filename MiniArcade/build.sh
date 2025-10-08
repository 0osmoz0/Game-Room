#!/bin/bash
# Script de compilation rapide pour Linux/macOS

echo "========================================="
echo "  Mini Arcade - Script de compilation"
echo "========================================="
echo ""

# Vérifier si CMake est installé
if ! command -v cmake &> /dev/null; then
    echo "❌ Erreur: CMake n'est pas installé!"
    echo ""
    echo "Installation:"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "  sudo apt install cmake        # Ubuntu/Debian"
        echo "  sudo dnf install cmake        # Fedora"
        echo "  sudo pacman -S cmake          # Arch"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  brew install cmake            # macOS"
    fi
    exit 1
fi

# Vérifier si SFML est installé (optionnel, CMake peut le télécharger)
echo "Vérification de SFML..."
if pkg-config --exists sfml-graphics 2>/dev/null; then
    echo "✓ SFML détecté sur le système"
else
    echo "⚠️  SFML non détecté - CMake le téléchargera automatiquement"
    echo "   (Cela peut prendre quelques minutes...)"
fi
echo ""

# Créer le dossier build
echo "Création du dossier build..."
mkdir -p build
cd build

# Configuration CMake
echo "Configuration du projet..."
cmake .. || { echo "❌ Échec de la configuration CMake"; exit 1; }

# Compilation
echo ""
echo "Compilation en cours..."
make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 2) || { echo "❌ Échec de la compilation"; exit 1; }

echo ""
echo "========================================="
echo "✓ Compilation réussie !"
echo "========================================="
echo ""
echo "Pour lancer le jeu :"
echo "  cd build"
echo "  ./MiniArcade"
echo ""

