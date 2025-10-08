#include "ResourceManager.hpp"
#include <iostream>

ResourceManager& ResourceManager::getInstance() {
    static ResourceManager instance;
    return instance;
}

std::shared_ptr<sf::Font> ResourceManager::loadFont(const std::string& name, const std::string& filepath) {
    // Vérifier si déjà chargée
    auto it = fonts.find(name);
    if (it != fonts.end()) {
        return it->second;
    }

    // Charger la nouvelle police
    auto font = std::make_shared<sf::Font>();
    if (!font->loadFromFile(filepath)) {
        std::cerr << "Erreur: Impossible de charger la police: " << filepath << std::endl;
        return nullptr;
    }

    fonts[name] = font;
    std::cout << "Police chargée: " << name << " (" << filepath << ")" << std::endl;
    return font;
}

std::shared_ptr<sf::Font> ResourceManager::getFont(const std::string& name) {
    auto it = fonts.find(name);
    if (it != fonts.end()) {
        return it->second;
    }
    return nullptr;
}

std::shared_ptr<sf::Texture> ResourceManager::loadTexture(const std::string& name, const std::string& filepath) {
    // Vérifier si déjà chargée
    auto it = textures.find(name);
    if (it != textures.end()) {
        return it->second;
    }

    // Charger la nouvelle texture
    auto texture = std::make_shared<sf::Texture>();
    if (!texture->loadFromFile(filepath)) {
        std::cerr << "Erreur: Impossible de charger la texture: " << filepath << std::endl;
        return nullptr;
    }

    textures[name] = texture;
    std::cout << "Texture chargée: " << name << " (" << filepath << ")" << std::endl;
    return texture;
}

std::shared_ptr<sf::Texture> ResourceManager::getTexture(const std::string& name) {
    auto it = textures.find(name);
    if (it != textures.end()) {
        return it->second;
    }
    return nullptr;
}

std::shared_ptr<sf::SoundBuffer> ResourceManager::loadSoundBuffer(const std::string& name, const std::string& filepath) {
    // Vérifier si déjà chargé
    auto it = soundBuffers.find(name);
    if (it != soundBuffers.end()) {
        return it->second;
    }

    // Charger le nouveau buffer
    auto buffer = std::make_shared<sf::SoundBuffer>();
    if (!buffer->loadFromFile(filepath)) {
        std::cerr << "Erreur: Impossible de charger le son: " << filepath << std::endl;
        return nullptr;
    }

    soundBuffers[name] = buffer;
    std::cout << "Son chargé: " << name << " (" << filepath << ")" << std::endl;
    return buffer;
}

std::shared_ptr<sf::SoundBuffer> ResourceManager::getSoundBuffer(const std::string& name) {
    auto it = soundBuffers.find(name);
    if (it != soundBuffers.end()) {
        return it->second;
    }
    return nullptr;
}

