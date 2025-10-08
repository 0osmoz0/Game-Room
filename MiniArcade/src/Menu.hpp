#pragma once
#include <SFML/Graphics.hpp>
#include <vector>
#include <string>

/**
 * @brief Menu principal de MiniArcade
 * 
 * Affiche le titre et une liste de mini-jeux sélectionnables.
 * Navigation avec les flèches haut/bas et validation avec Entrée.
 */
class Menu {
private:
    sf::RenderWindow& window;
    sf::Font font;
    sf::Text title;
    std::vector<sf::Text> menuItems;
    int selectedIndex;
    bool menuActive;

    void initializeMenu();
    void handleInput();
    void update();
    void render();

public:
    /**
     * @brief Constructeur du menu
     * @param win Référence vers la fenêtre SFML
     */
    explicit Menu(sf::RenderWindow& win);

    /**
     * @brief Affiche le menu et attend la sélection de l'utilisateur
     * @return Index du jeu sélectionné (0-2) ou -1 pour quitter
     */
    int run();
};

