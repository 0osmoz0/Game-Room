#include "Menu.hpp"
#include "utils/ResourceManager.hpp"
#include <iostream>

Menu::Menu(sf::RenderWindow& win) 
    : window(win), selectedIndex(0), menuActive(true) {
    initializeMenu();
}

void Menu::initializeMenu() {
    // Charger la police
    auto fontPtr = ResourceManager::getInstance().getFont("main");
    if (fontPtr) {
        font = *fontPtr;
    } else {
        std::cerr << "Erreur: Police non chargée pour le menu!" << std::endl;
        return;
    }

    // Titre
    title.setFont(font);
    title.setString("MINI ARCADE");
    title.setCharacterSize(72);
    title.setFillColor(sf::Color::Cyan);
    title.setStyle(sf::Text::Bold);
    
    // Centrer le titre
    sf::FloatRect titleBounds = title.getLocalBounds();
    title.setOrigin(titleBounds.width / 2.0f, titleBounds.height / 2.0f);
    title.setPosition(window.getSize().x / 2.0f, 100.0f);

    // Options du menu
    std::vector<std::string> options = {
        "1. Reflex Game",
        "2. Snake Game",
        "3. Pong Game",
        "4. Quitter"
    };

    float startY = 250.0f;
    float spacing = 60.0f;

    for (size_t i = 0; i < options.size(); ++i) {
        sf::Text text;
        text.setFont(font);
        text.setString(options[i]);
        text.setCharacterSize(36);
        text.setFillColor(sf::Color::White);
        
        sf::FloatRect bounds = text.getLocalBounds();
        text.setOrigin(bounds.width / 2.0f, bounds.height / 2.0f);
        text.setPosition(window.getSize().x / 2.0f, startY + i * spacing);
        
        menuItems.push_back(text);
    }

    // Mettre en surbrillance le premier élément
    menuItems[0].setFillColor(sf::Color::Yellow);
    menuItems[0].setStyle(sf::Text::Bold);
}

void Menu::handleInput() {
    sf::Event event;
    while (window.pollEvent(event)) {
        if (event.type == sf::Event::Closed) {
            window.close();
            menuActive = false;
        }

        if (event.type == sf::Event::KeyPressed) {
            if (event.key.code == sf::Keyboard::Up) {
                // Retirer la surbrillance de l'élément actuel
                menuItems[selectedIndex].setFillColor(sf::Color::White);
                menuItems[selectedIndex].setStyle(sf::Text::Regular);

                // Sélectionner l'élément précédent
                selectedIndex = (selectedIndex - 1 + menuItems.size()) % menuItems.size();

                // Appliquer la surbrillance
                menuItems[selectedIndex].setFillColor(sf::Color::Yellow);
                menuItems[selectedIndex].setStyle(sf::Text::Bold);
            }
            else if (event.key.code == sf::Keyboard::Down) {
                // Retirer la surbrillance
                menuItems[selectedIndex].setFillColor(sf::Color::White);
                menuItems[selectedIndex].setStyle(sf::Text::Regular);

                // Sélectionner l'élément suivant
                selectedIndex = (selectedIndex + 1) % menuItems.size();

                // Appliquer la surbrillance
                menuItems[selectedIndex].setFillColor(sf::Color::Yellow);
                menuItems[selectedIndex].setStyle(sf::Text::Bold);
            }
            else if (event.key.code == sf::Keyboard::Enter || event.key.code == sf::Keyboard::Space) {
                menuActive = false;
            }
            else if (event.key.code == sf::Keyboard::Escape) {
                selectedIndex = 3; // Option "Quitter"
                menuActive = false;
            }
        }
    }
}

void Menu::update() {
    // Pas de logique de mise à jour pour le moment
}

void Menu::render() {
    window.clear(sf::Color(20, 20, 40));
    
    // Dessiner le titre
    window.draw(title);
    
    // Dessiner les options du menu
    for (const auto& item : menuItems) {
        window.draw(item);
    }
    
    // Afficher les instructions en bas
    sf::Text instructions;
    instructions.setFont(font);
    instructions.setString("Fleches: Naviguer | Entree: Selectionner | Echap: Quitter");
    instructions.setCharacterSize(18);
    instructions.setFillColor(sf::Color(150, 150, 150));
    sf::FloatRect bounds = instructions.getLocalBounds();
    instructions.setOrigin(bounds.width / 2.0f, bounds.height / 2.0f);
    instructions.setPosition(window.getSize().x / 2.0f, window.getSize().y - 30.0f);
    window.draw(instructions);
    
    window.display();
}

int Menu::run() {
    menuActive = true;
    selectedIndex = 0;

    while (window.isOpen() && menuActive) {
        handleInput();
        update();
        render();
    }

    // Retourner l'index sélectionné (3 = quitter, donc on retourne -1)
    return selectedIndex == 3 ? -1 : selectedIndex;
}

