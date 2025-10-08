#pragma once
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <memory>
#include <map>
#include <string>

/**
 * @brief Gestionnaire centralisé de ressources (polices, textures, sons, musiques)
 * 
 * Implémente le pattern Singleton pour garantir un accès unique aux ressources.
 * Gère le chargement et le stockage en cache des ressources pour éviter les duplications.
 */
class ResourceManager {
private:
    std::map<std::string, std::shared_ptr<sf::Font>> fonts;
    std::map<std::string, std::shared_ptr<sf::Texture>> textures;
    std::map<std::string, std::shared_ptr<sf::SoundBuffer>> soundBuffers;
    std::map<std::string, std::shared_ptr<sf::Music>> musics;

    ResourceManager() = default;

public:
    // Suppression du constructeur de copie et de l'opérateur d'affectation (Singleton)
    ResourceManager(const ResourceManager&) = delete;
    ResourceManager& operator=(const ResourceManager&) = delete;

    /**
     * @brief Obtient l'instance unique du ResourceManager
     * @return Référence vers l'instance du gestionnaire
     */
    static ResourceManager& getInstance();

    /**
     * @brief Charge une police de caractères
     * @param name Nom/identifiant de la police
     * @param filepath Chemin vers le fichier .ttf
     * @return Pointeur partagé vers la police chargée (nullptr en cas d'erreur)
     */
    std::shared_ptr<sf::Font> loadFont(const std::string& name, const std::string& filepath);

    /**
     * @brief Récupère une police chargée
     * @param name Nom de la police
     * @return Pointeur partagé vers la police (nullptr si non trouvée)
     */
    std::shared_ptr<sf::Font> getFont(const std::string& name);

    /**
     * @brief Charge une texture
     * @param name Nom/identifiant de la texture
     * @param filepath Chemin vers le fichier image
     * @return Pointeur partagé vers la texture chargée (nullptr en cas d'erreur)
     */
    std::shared_ptr<sf::Texture> loadTexture(const std::string& name, const std::string& filepath);

    /**
     * @brief Récupère une texture chargée
     * @param name Nom de la texture
     * @return Pointeur partagé vers la texture (nullptr si non trouvée)
     */
    std::shared_ptr<sf::Texture> getTexture(const std::string& name);

    /**
     * @brief Charge un buffer de son
     * @param name Nom/identifiant du son
     * @param filepath Chemin vers le fichier audio
     * @return Pointeur partagé vers le buffer (nullptr en cas d'erreur)
     */
    std::shared_ptr<sf::SoundBuffer> loadSoundBuffer(const std::string& name, const std::string& filepath);

    /**
     * @brief Récupère un buffer de son chargé
     * @param name Nom du son
     * @return Pointeur partagé vers le buffer (nullptr si non trouvé)
     */
    std::shared_ptr<sf::SoundBuffer> getSoundBuffer(const std::string& name);
};

