#include "PongGame.hpp"
#include "utils/ResourceManager.hpp"
#include <sstream>
#include <cmath>
#include <random>

PongGame::PongGame(sf::RenderWindow& win)
    : Game(win), leftScore(0), rightScore(0), gameWon(false) {
    
    // Charger la police
    auto fontPtr = ResourceManager::getInstance().getFont("main");
    if (fontPtr) {
        font = *fontPtr;
    }

    // Configuration des raquettes
    leftPaddle.setSize(sf::Vector2f(PADDLE_WIDTH, PADDLE_HEIGHT));
    leftPaddle.setFillColor(sf::Color::White);
    leftPaddle.setPosition(30.0f, window.getSize().y / 2.0f - PADDLE_HEIGHT / 2.0f);

    rightPaddle.setSize(sf::Vector2f(PADDLE_WIDTH, PADDLE_HEIGHT));
    rightPaddle.setFillColor(sf::Color::White);
    rightPaddle.setPosition(window.getSize().x - 30.0f - PADDLE_WIDTH, 
                            window.getSize().y / 2.0f - PADDLE_HEIGHT / 2.0f);

    // Configuration de la balle
    ball.setRadius(BALL_RADIUS);
    ball.setFillColor(sf::Color::Yellow);
    ball.setOrigin(BALL_RADIUS, BALL_RADIUS);

    // Textes
    scoreText.setFont(font);
    scoreText.setCharacterSize(36);
    scoreText.setFillColor(sf::Color::White);

    winnerText.setFont(font);
    winnerText.setCharacterSize(48);
    winnerText.setFillColor(sf::Color::Green);
    winnerText.setStyle(sf::Text::Bold);

    resetBall();
}

void PongGame::resetBall() {
    ball.setPosition(window.getSize().x / 2.0f, window.getSize().y / 2.0f);
    
    // Direction aléatoire
    std::random_device rd;
    std::mt19937 gen(rd());
    std::uniform_real_distribution<float> angleDist(-45.0f, 45.0f);
    std::uniform_int_distribution<int> directionDist(0, 1);
    
    float angle = angleDist(gen) * 3.14159f / 180.0f;
    float direction = directionDist(gen) == 0 ? -1.0f : 1.0f;
    
    ballVelocity.x = direction * BALL_SPEED * std::cos(angle);
    ballVelocity.y = BALL_SPEED * std::sin(angle);
}

void PongGame::resetGame() {
    leftScore = 0;
    rightScore = 0;
    gameWon = false;
    resetBall();
}

void PongGame::handleEvents() {
    sf::Event event;
    while (window.pollEvent(event)) {
        if (event.type == sf::Event::Closed) {
            window.close();
        }

        if (event.type == sf::Event::KeyPressed) {
            if (event.key.code == sf::Keyboard::Escape) {
                returnToMenu = true;
            }

            if (gameWon && event.key.code == sf::Keyboard::Space) {
                resetGame();
            }
        }
    }
}

void PongGame::update(float deltaTime) {
    if (gameWon) return;

    // Mouvement des raquettes
    // Joueur 1 (gauche) : Z (haut) / S (bas)
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Z)) {
        leftPaddle.move(0.0f, -PADDLE_SPEED * deltaTime);
    }
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::S)) {
        leftPaddle.move(0.0f, PADDLE_SPEED * deltaTime);
    }

    // Joueur 2 (droite) : Flèches
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Up)) {
        rightPaddle.move(0.0f, -PADDLE_SPEED * deltaTime);
    }
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Down)) {
        rightPaddle.move(0.0f, PADDLE_SPEED * deltaTime);
    }

    // Limiter les raquettes à l'écran
    if (leftPaddle.getPosition().y < 0) {
        leftPaddle.setPosition(leftPaddle.getPosition().x, 0);
    }
    if (leftPaddle.getPosition().y + PADDLE_HEIGHT > window.getSize().y) {
        leftPaddle.setPosition(leftPaddle.getPosition().x, window.getSize().y - PADDLE_HEIGHT);
    }
    if (rightPaddle.getPosition().y < 0) {
        rightPaddle.setPosition(rightPaddle.getPosition().x, 0);
    }
    if (rightPaddle.getPosition().y + PADDLE_HEIGHT > window.getSize().y) {
        rightPaddle.setPosition(rightPaddle.getPosition().x, window.getSize().y - PADDLE_HEIGHT);
    }

    // Mouvement de la balle
    ball.move(ballVelocity * deltaTime);

    // Collision avec les murs haut/bas
    if (ball.getPosition().y - BALL_RADIUS <= 0 || 
        ball.getPosition().y + BALL_RADIUS >= window.getSize().y) {
        ballVelocity.y = -ballVelocity.y;
    }

    // Collision avec les raquettes
    checkCollisions();

    // Détection des points marqués
    if (ball.getPosition().x < 0) {
        rightScore++;
        resetBall();
    }
    if (ball.getPosition().x > window.getSize().x) {
        leftScore++;
        resetBall();
    }

    // Vérifier la victoire
    if (leftScore >= WINNING_SCORE) {
        gameWon = true;
        winnerText.setString("JOUEUR 1 GAGNE!\nEspace: Rejouer | Echap: Menu");
        sf::FloatRect bounds = winnerText.getLocalBounds();
        winnerText.setOrigin(bounds.width / 2.0f, bounds.height / 2.0f);
        winnerText.setPosition(window.getSize().x / 2.0f, window.getSize().y / 2.0f);
    }
    if (rightScore >= WINNING_SCORE) {
        gameWon = true;
        winnerText.setString("JOUEUR 2 GAGNE!\nEspace: Rejouer | Echap: Menu");
        sf::FloatRect bounds = winnerText.getLocalBounds();
        winnerText.setOrigin(bounds.width / 2.0f, bounds.height / 2.0f);
        winnerText.setPosition(window.getSize().x / 2.0f, window.getSize().y / 2.0f);
    }

    // Mise à jour du score
    std::ostringstream oss;
    oss << leftScore << "  :  " << rightScore;
    scoreText.setString(oss.str());
    sf::FloatRect bounds = scoreText.getLocalBounds();
    scoreText.setOrigin(bounds.width / 2.0f, 0);
    scoreText.setPosition(window.getSize().x / 2.0f, 20.0f);
}

void PongGame::checkCollisions() {
    sf::FloatRect ballBounds = ball.getGlobalBounds();
    sf::FloatRect leftBounds = leftPaddle.getGlobalBounds();
    sf::FloatRect rightBounds = rightPaddle.getGlobalBounds();

    if (ballBounds.intersects(leftBounds)) {
        if (ballVelocity.x < 0) {
            ballVelocity.x = -ballVelocity.x;
            // Ajouter un effet en fonction de l'endroit où la balle touche la raquette
            float relativeIntersectY = (leftPaddle.getPosition().y + PADDLE_HEIGHT / 2.0f) - ball.getPosition().y;
            float normalizedIntersect = relativeIntersectY / (PADDLE_HEIGHT / 2.0f);
            ballVelocity.y = -normalizedIntersect * BALL_SPEED * 0.75f;
        }
    }

    if (ballBounds.intersects(rightBounds)) {
        if (ballVelocity.x > 0) {
            ballVelocity.x = -ballVelocity.x;
            float relativeIntersectY = (rightPaddle.getPosition().y + PADDLE_HEIGHT / 2.0f) - ball.getPosition().y;
            float normalizedIntersect = relativeIntersectY / (PADDLE_HEIGHT / 2.0f);
            ballVelocity.y = -normalizedIntersect * BALL_SPEED * 0.75f;
        }
    }
}

void PongGame::render() {
    window.clear(sf::Color(10, 10, 30));
    
    // Ligne centrale
    sf::RectangleShape centerLine(sf::Vector2f(2.0f, window.getSize().y));
    centerLine.setPosition(window.getSize().x / 2.0f - 1.0f, 0);
    centerLine.setFillColor(sf::Color(80, 80, 80));
    window.draw(centerLine);
    
    // Dessiner les éléments de jeu
    window.draw(leftPaddle);
    window.draw(rightPaddle);
    window.draw(ball);
    window.draw(scoreText);
    
    // Instructions en bas
    sf::Text instructions;
    instructions.setFont(font);
    instructions.setString("J1: Z/S | J2: Fleches | Echap: Menu");
    instructions.setCharacterSize(18);
    instructions.setFillColor(sf::Color(120, 120, 120));
    sf::FloatRect bounds = instructions.getLocalBounds();
    instructions.setOrigin(bounds.width / 2.0f, 0);
    instructions.setPosition(window.getSize().x / 2.0f, window.getSize().y - 30.0f);
    window.draw(instructions);
    
    // Message de victoire
    if (gameWon) {
        window.draw(winnerText);
    }
    
    window.display();
}

void PongGame::run() {
    returnToMenu = false;
    clock.restart();

    while (window.isOpen() && !returnToMenu) {
        float deltaTime = clock.restart().asSeconds();
        
        handleEvents();
        update(deltaTime);
        render();
    }
}

