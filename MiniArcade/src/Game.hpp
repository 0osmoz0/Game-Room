#pragma once
#include <SFML/Graphics.hpp>

/**
 * @brief Classe abstraite de base pour tous les jeux
 * 
 * Cette classe définit l'interface commune que tous les mini-jeux doivent implémenter.
 * Elle fournit une fenêtre SFML partagée et impose l'implémentation d'une méthode run().
 */
class Game {
protected:
    sf::RenderWindow& window;
    bool returnToMenu;

public:
    /**
     * @brief Constructeur
     * @param win Référence vers la fenêtre SFML principale
     */
    explicit Game(sf::RenderWindow& win) 
        : window(win), returnToMenu(false) {}

    /**
     * @brief Destructeur virtuel
     */
    virtual ~Game() = default;

    /**
     * @brief Boucle principale du jeu (à implémenter dans les classes dérivées)
     * 
     * Cette méthode contient la logique principale du jeu :
     * - Gestion des événements
     * - Mise à jour de l'état du jeu
     * - Rendu graphique
     * 
     * La méthode se termine lorsque returnToMenu devient true (touche Échap)
     */
    virtual void run() = 0;

    /**
     * @brief Vérifie si l'utilisateur veut retourner au menu
     * @return true si Échap a été pressé
     */
    bool shouldReturnToMenu() const {
        return returnToMenu;
    }
};

