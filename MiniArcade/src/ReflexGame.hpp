#pragma once
#include "Game.hpp"
#include <SFML/Graphics.hpp>
#include <random>

/**
 * @brief Jeu de réflexes
 * 
 * Un carré apparaît en rouge, puis devient vert aléatoirement.
 * Le joueur doit cliquer le plus rapidement possible quand il devient vert.
 * Le temps de réaction est affiché et le score augmente.
 */
class ReflexGame : public Game {
private:
    enum class State {
        WAITING,      // Attente du clic pour commencer
        RED_PHASE,    // Carré rouge (attendre)
        GREEN_PHASE,  // Carré vert (cliquer maintenant!)
        TOO_EARLY,    // Cliqué trop tôt (pénalité)
        RESULT        // Affichage du résultat
    };

    State currentState;
    sf::RectangleShape targetSquare;
    sf::Clock clock;
    sf::Clock greenClock;
    sf::Font font;
    sf::Text instructionText;
    sf::Text scoreText;
    sf::Text reactionTimeText;

    int score;
    float lastReactionTime;
    float waitTime;

    std::mt19937 rng;
    std::uniform_real_distribution<float> dist;

    void handleEvents();
    void update();
    void render();
    void resetRound();
    void updateTexts();

public:
    explicit ReflexGame(sf::RenderWindow& win);
    void run() override;
};

