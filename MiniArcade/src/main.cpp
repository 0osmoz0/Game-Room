#include <SFML/Graphics.hpp>
#include <iostream>
#include <memory>

#include "Menu.hpp"
#include "ReflexGame.hpp"
#include "SnakeGame.hpp"
#include "PongGame.hpp"
#include "utils/ResourceManager.hpp"

/**
 * @brief Point d'entrée principal de MiniArcade
 * 
 * Initialise la fenêtre SFML, charge les ressources et gère la boucle
 * menu -> jeu -> menu.
 */
int main() {
    // Création de la fenêtre
    sf::RenderWindow window(sf::VideoMode(800, 600), "Mini Arcade", 
                           sf::Style::Titlebar | sf::Style::Close);
    window.setFramerateLimit(60);

    // Chargement des ressources
    std::cout << "=== Mini Arcade - Démarrage ===" << std::endl;
    
    auto& resourceManager = ResourceManager::getInstance();
    
    // Charger la police principale
    auto font = resourceManager.loadFont("main", "assets/font.ttf");
    if (!font) {
        std::cerr << "ERREUR CRITIQUE: Impossible de charger la police!" << std::endl;
        std::cerr << "Assurez-vous que le fichier 'assets/font.ttf' existe." << std::endl;
        return EXIT_FAILURE;
    }

    std::cout << "Ressources chargées avec succès!" << std::endl;

    // Boucle principale : Menu -> Jeu -> Menu
    while (window.isOpen()) {
        // Afficher le menu et obtenir le choix
        Menu menu(window);
        int choice = menu.run();

        // Si l'utilisateur a fermé la fenêtre ou choisi de quitter
        if (!window.isOpen() || choice == -1) {
            break;
        }

        // Créer et lancer le jeu sélectionné
        std::unique_ptr<Game> currentGame;

        switch (choice) {
            case 0:
                std::cout << "Lancement de Reflex Game..." << std::endl;
                currentGame = std::make_unique<ReflexGame>(window);
                break;
            case 1:
                std::cout << "Lancement de Snake Game..." << std::endl;
                currentGame = std::make_unique<SnakeGame>(window);
                break;
            case 2:
                std::cout << "Lancement de Pong Game..." << std::endl;
                currentGame = std::make_unique<PongGame>(window);
                break;
            default:
                std::cerr << "Choix invalide: " << choice << std::endl;
                continue;
        }

        // Exécuter le jeu
        if (currentGame) {
            currentGame->run();
        }
    }

    std::cout << "=== Mini Arcade - Fermeture ===" << std::endl;
    return EXIT_SUCCESS;
}

