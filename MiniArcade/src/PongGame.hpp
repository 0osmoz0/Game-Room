#pragma once
#include "Game.hpp"
#include <SFML/Graphics.hpp>

/**
 * @brief Jeu de Pong classique
 * 
 * Deux raquettes et une balle. Joueur 1 (gauche) contrôle avec Z/S,
 * Joueur 2 (droite) contrôle avec les flèches Haut/Bas.
 * Le premier à atteindre 5 points gagne.
 */
class PongGame : public Game {
private:
    static constexpr float PADDLE_WIDTH = 15.0f;
    static constexpr float PADDLE_HEIGHT = 100.0f;
    static constexpr float BALL_RADIUS = 8.0f;
    static constexpr float PADDLE_SPEED = 400.0f;
    static constexpr float BALL_SPEED = 300.0f;
    static constexpr int WINNING_SCORE = 5;

    sf::RectangleShape leftPaddle;
    sf::RectangleShape rightPaddle;
    sf::CircleShape ball;
    
    sf::Vector2f ballVelocity;
    sf::Clock clock;
    sf::Font font;
    sf::Text scoreText;
    sf::Text winnerText;
    
    int leftScore;
    int rightScore;
    bool gameWon;

    void handleEvents();
    void update(float deltaTime);
    void render();
    void resetBall();
    void resetGame();
    void checkCollisions();

public:
    explicit PongGame(sf::RenderWindow& win);
    void run() override;
};

