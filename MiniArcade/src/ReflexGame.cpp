#include "ReflexGame.hpp"
#include "utils/ResourceManager.hpp"
#include "utils/ScoreManager.hpp"
#include <sstream>
#include <iomanip>

ReflexGame::ReflexGame(sf::RenderWindow& win)
    : Game(win), currentState(State::WAITING), score(0), lastReactionTime(0.0f),
      rng(std::random_device{}()), dist(1.5f, 4.0f) {
    
    // Charger la police
    auto fontPtr = ResourceManager::getInstance().getFont("main");
    if (fontPtr) {
        font = *fontPtr;
    }

    // Configuration du carré cible
    targetSquare.setSize(sf::Vector2f(200.0f, 200.0f));
    targetSquare.setOrigin(100.0f, 100.0f);
    targetSquare.setPosition(window.getSize().x / 2.0f, window.getSize().y / 2.0f);
    targetSquare.setFillColor(sf::Color::Red);

    // Textes
    instructionText.setFont(font);
    instructionText.setCharacterSize(24);
    instructionText.setFillColor(sf::Color::White);
    instructionText.setPosition(50.0f, 50.0f);

    scoreText.setFont(font);
    scoreText.setCharacterSize(30);
    scoreText.setFillColor(sf::Color::Yellow);
    scoreText.setPosition(50.0f, window.getSize().y - 100.0f);

    reactionTimeText.setFont(font);
    reactionTimeText.setCharacterSize(28);
    reactionTimeText.setFillColor(sf::Color::Cyan);
    reactionTimeText.setPosition(50.0f, window.getSize().y - 60.0f);

    updateTexts();
    resetRound();
}

void ReflexGame::resetRound() {
    currentState = State::WAITING;
    targetSquare.setFillColor(sf::Color(100, 100, 100));
    waitTime = dist(rng);
    updateTexts();
}

void ReflexGame::updateTexts() {
    int highScore = ScoreManager::getInstance().getHighScore("ReflexGame");
    std::ostringstream oss;
    oss << "Score: " << score << " | Record: " << highScore;
    scoreText.setString(oss.str());

    if (lastReactionTime > 0.0f) {
        std::ostringstream rss;
        rss << "Dernier temps: " << std::fixed << std::setprecision(3) 
            << lastReactionTime << " secondes";
        reactionTimeText.setString(rss.str());
    } else {
        reactionTimeText.setString("");
    }

    switch (currentState) {
        case State::WAITING:
            instructionText.setString("Cliquez sur le carre pour commencer!\nEchap: Retour au menu");
            break;
        case State::RED_PHASE:
            instructionText.setString("ATTENDEZ que le carre devienne VERT...");
            break;
        case State::GREEN_PHASE:
            instructionText.setString("CLIQUEZ MAINTENANT!");
            break;
        case State::TOO_EARLY:
            instructionText.setString("TROP TOT! Attendez le vert!\nClic pour reessayer");
            break;
        case State::RESULT:
            instructionText.setString("Excellent! Clic pour continuer");
            break;
    }
}

void ReflexGame::handleEvents() {
    sf::Event event;
    while (window.pollEvent(event)) {
        if (event.type == sf::Event::Closed) {
            window.close();
        }

        if (event.type == sf::Event::KeyPressed && event.key.code == sf::Keyboard::Escape) {
            returnToMenu = true;
        }

        if (event.type == sf::Event::MouseButtonPressed) {
            sf::Vector2f mousePos(event.mouseButton.x, event.mouseButton.y);
            
            if (targetSquare.getGlobalBounds().contains(mousePos)) {
                switch (currentState) {
                    case State::WAITING:
                        currentState = State::RED_PHASE;
                        targetSquare.setFillColor(sf::Color::Red);
                        clock.restart();
                        break;

                    case State::RED_PHASE:
                        // Cliqué trop tôt!
                        currentState = State::TOO_EARLY;
                        targetSquare.setFillColor(sf::Color(150, 0, 0));
                        score = std::max(0, score - 1); // Pénalité
                        break;

                    case State::GREEN_PHASE:
                        // Bon clic!
                        lastReactionTime = greenClock.getElapsedTime().asSeconds();
                        score++;
                        ScoreManager::getInstance().updateHighScore("ReflexGame", score);
                        currentState = State::RESULT;
                        break;

                    case State::TOO_EARLY:
                    case State::RESULT:
                        resetRound();
                        break;
                }
                updateTexts();
            }
        }
    }
}

void ReflexGame::update() {
    if (currentState == State::RED_PHASE) {
        if (clock.getElapsedTime().asSeconds() >= waitTime) {
            currentState = State::GREEN_PHASE;
            targetSquare.setFillColor(sf::Color::Green);
            greenClock.restart();
            updateTexts();
        }
    }
}

void ReflexGame::render() {
    window.clear(sf::Color(30, 30, 50));
    
    window.draw(targetSquare);
    window.draw(instructionText);
    window.draw(scoreText);
    window.draw(reactionTimeText);
    
    window.display();
}

void ReflexGame::run() {
    returnToMenu = false;

    while (window.isOpen() && !returnToMenu) {
        handleEvents();
        update();
        render();
    }
}

