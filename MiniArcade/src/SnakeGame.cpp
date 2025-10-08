#include "SnakeGame.hpp"
#include "utils/ResourceManager.hpp"
#include "utils/ScoreManager.hpp"
#include <sstream>

SnakeGame::SnakeGame(sf::RenderWindow& win)
    : Game(win), currentDirection(Direction::RIGHT), nextDirection(Direction::RIGHT),
      score(0), gameOver(false), rng(std::random_device{}()) {
    
    // Charger la police
    auto fontPtr = ResourceManager::getInstance().getFont("main");
    if (fontPtr) {
        font = *fontPtr;
    }

    // Configuration des textes
    scoreText.setFont(font);
    scoreText.setCharacterSize(24);
    scoreText.setFillColor(sf::Color::Yellow);
    scoreText.setPosition(10.0f, 10.0f);

    gameOverText.setFont(font);
    gameOverText.setString("GAME OVER!\nAppuyez sur ESPACE pour rejouer\nEchap: Retour au menu");
    gameOverText.setCharacterSize(32);
    gameOverText.setFillColor(sf::Color::Red);
    gameOverText.setStyle(sf::Text::Bold);
    
    sf::FloatRect bounds = gameOverText.getLocalBounds();
    gameOverText.setOrigin(bounds.width / 2.0f, bounds.height / 2.0f);
    gameOverText.setPosition(window.getSize().x / 2.0f, window.getSize().y / 2.0f);

    resetGame();
}

void SnakeGame::resetGame() {
    snake.clear();
    snake.push_back({GRID_SIZE / 2, GRID_SIZE / 2});
    snake.push_back({GRID_SIZE / 2 - 1, GRID_SIZE / 2});
    snake.push_back({GRID_SIZE / 2 - 2, GRID_SIZE / 2});
    
    currentDirection = Direction::RIGHT;
    nextDirection = Direction::RIGHT;
    score = 0;
    gameOver = false;
    
    spawnApple();
    moveClock.restart();
}

void SnakeGame::spawnApple() {
    std::uniform_int_distribution<int> dist(0, GRID_SIZE - 1);
    
    do {
        apple.x = dist(rng);
        apple.y = dist(rng);
    } while (isPositionOnSnake(apple));
}

bool SnakeGame::isPositionOnSnake(const Position& pos) const {
    for (const auto& segment : snake) {
        if (segment == pos) {
            return true;
        }
    }
    return false;
}

void SnakeGame::moveSnake() {
    currentDirection = nextDirection;
    
    Position newHead = snake.front();
    
    switch (currentDirection) {
        case Direction::UP:    newHead.y--; break;
        case Direction::DOWN:  newHead.y++; break;
        case Direction::LEFT:  newHead.x--; break;
        case Direction::RIGHT: newHead.x++; break;
    }
    
    // Vérifier les collisions avec les murs
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || 
        newHead.y < 0 || newHead.y >= GRID_SIZE) {
        gameOver = true;
        return;
    }
    
    // Vérifier les collisions avec le corps
    if (isPositionOnSnake(newHead)) {
        gameOver = true;
        return;
    }
    
    snake.push_front(newHead);
    
    // Vérifier si le serpent mange la pomme
    if (newHead == apple) {
        score++;
        ScoreManager::getInstance().updateHighScore("SnakeGame", score);
        spawnApple();
    } else {
        snake.pop_back();
    }
}

void SnakeGame::handleEvents() {
    sf::Event event;
    while (window.pollEvent(event)) {
        if (event.type == sf::Event::Closed) {
            window.close();
        }

        if (event.type == sf::Event::KeyPressed) {
            if (event.key.code == sf::Keyboard::Escape) {
                returnToMenu = true;
            }

            if (gameOver && event.key.code == sf::Keyboard::Space) {
                resetGame();
            }

            if (!gameOver) {
                // Empêcher les demi-tours
                if (event.key.code == sf::Keyboard::Up && currentDirection != Direction::DOWN) {
                    nextDirection = Direction::UP;
                }
                else if (event.key.code == sf::Keyboard::Down && currentDirection != Direction::UP) {
                    nextDirection = Direction::DOWN;
                }
                else if (event.key.code == sf::Keyboard::Left && currentDirection != Direction::RIGHT) {
                    nextDirection = Direction::LEFT;
                }
                else if (event.key.code == sf::Keyboard::Right && currentDirection != Direction::LEFT) {
                    nextDirection = Direction::RIGHT;
                }
            }
        }
    }
}

void SnakeGame::update() {
    if (!gameOver && moveClock.getElapsedTime().asSeconds() >= MOVE_INTERVAL) {
        moveSnake();
        moveClock.restart();
    }
    
    int highScore = ScoreManager::getInstance().getHighScore("SnakeGame");
    std::ostringstream oss;
    oss << "Score: " << score << " | Record: " << highScore << " | Fleches: Deplacer | Echap: Menu";
    scoreText.setString(oss.str());
}

void SnakeGame::render() {
    window.clear(sf::Color(20, 20, 20));
    
    // Calculer le décalage pour centrer la grille
    float offsetX = (window.getSize().x - GRID_SIZE * CELL_SIZE) / 2.0f;
    float offsetY = (window.getSize().y - GRID_SIZE * CELL_SIZE) / 2.0f + 30.0f;
    
    // Dessiner la grille
    sf::RectangleShape cell(sf::Vector2f(CELL_SIZE - 1.0f, CELL_SIZE - 1.0f));
    
    // Dessiner le serpent
    for (size_t i = 0; i < snake.size(); ++i) {
        const auto& segment = snake[i];
        cell.setPosition(offsetX + segment.x * CELL_SIZE, offsetY + segment.y * CELL_SIZE);
        
        if (i == 0) {
            cell.setFillColor(sf::Color::Green); // Tête
        } else {
            cell.setFillColor(sf::Color(0, 200, 0)); // Corps
        }
        window.draw(cell);
    }
    
    // Dessiner la pomme
    cell.setPosition(offsetX + apple.x * CELL_SIZE, offsetY + apple.y * CELL_SIZE);
    cell.setFillColor(sf::Color::Red);
    window.draw(cell);
    
    // Dessiner le contour de la grille
    sf::RectangleShape border(sf::Vector2f(GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE));
    border.setPosition(offsetX, offsetY);
    border.setFillColor(sf::Color::Transparent);
    border.setOutlineColor(sf::Color(100, 100, 100));
    border.setOutlineThickness(2.0f);
    window.draw(border);
    
    // Afficher le score
    window.draw(scoreText);
    
    // Afficher Game Over si nécessaire
    if (gameOver) {
        window.draw(gameOverText);
    }
    
    window.display();
}

void SnakeGame::run() {
    returnToMenu = false;

    while (window.isOpen() && !returnToMenu) {
        handleEvents();
        update();
        render();
    }
}

