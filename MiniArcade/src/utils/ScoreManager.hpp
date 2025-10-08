#pragma once
#include <string>
#include <map>

/**
 * @brief Gestionnaire de sauvegarde des scores
 * 
 * Enregistre et charge les meilleurs scores de chaque jeu dans un fichier.
 * Pattern Singleton pour accès global.
 */
class ScoreManager {
private:
    std::map<std::string, int> highScores;
    std::string filename;

    ScoreManager();
    void loadScores();
    void saveScores();

public:
    ScoreManager(const ScoreManager&) = delete;
    ScoreManager& operator=(const ScoreManager&) = delete;

    static ScoreManager& getInstance();

    /**
     * @brief Obtient le meilleur score pour un jeu
     * @param gameName Nom du jeu
     * @return Meilleur score (0 si aucun)
     */
    int getHighScore(const std::string& gameName);

    /**
     * @brief Enregistre un score si c'est un nouveau record
     * @param gameName Nom du jeu
     * @param score Score à enregistrer
     * @return true si c'est un nouveau record
     */
    bool updateHighScore(const std::string& gameName, int score);

    /**
     * @brief Réinitialise tous les scores
     */
    void resetAllScores();
};

