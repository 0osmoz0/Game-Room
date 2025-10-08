#pragma once
#include "Game.hpp"
#include <SFML/Graphics.hpp>
#include <deque>
#include <random>

/**
 * @brief Jeu du Snake classique
 * 
 * Un serpent se déplace sur une grille et doit manger des pommes.
 * À chaque pomme mangée, le serpent grandit et le score augmente.
 * Game over si le serpent se mord lui-même ou sort de la grille.
 */
class SnakeGame : public Game {
private:
    static constexpr int GRID_SIZE = 20;
    static constexpr float CELL_SIZE = 25.0f;
    static constexpr float MOVE_INTERVAL = 0.15f;

    enum class Direction {
        UP, DOWN, LEFT, RIGHT
    };

    struct Position {
        int x, y;
        bool operator==(const Position& other) const {
            return x == other.x && y == other.y;
        }
    };

    std::deque<Position> snake;
    Position apple;
    Direction currentDirection;
    Direction nextDirection;
    
    sf::Clock moveClock;
    sf::Font font;
    sf::Text scoreText;
    sf::Text gameOverText;
    
    int score;
    bool gameOver;
    std::mt19937 rng;

    void handleEvents();
    void update();
    void render();
    void resetGame();
    void spawnApple();
    bool isPositionOnSnake(const Position& pos) const;
    void moveSnake();

public:
    explicit SnakeGame(sf::RenderWindow& win);
    void run() override;
};

