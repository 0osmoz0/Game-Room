#include "ScoreManager.hpp"
#include <fstream>
#include <iostream>
#include <sstream>

ScoreManager::ScoreManager() : filename("highscores.txt") {
    loadScores();
}

ScoreManager& ScoreManager::getInstance() {
    static ScoreManager instance;
    return instance;
}

void ScoreManager::loadScores() {
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cout << "Aucun fichier de scores trouvé (création au premier enregistrement)" << std::endl;
        return;
    }

    std::string line;
    while (std::getline(file, line)) {
        std::istringstream iss(line);
        std::string gameName;
        int score;

        if (std::getline(iss, gameName, ':') && iss >> score) {
            highScores[gameName] = score;
            std::cout << "Score chargé: " << gameName << " = " << score << std::endl;
        }
    }

    file.close();
}

void ScoreManager::saveScores() {
    std::ofstream file(filename);
    if (!file.is_open()) {
        std::cerr << "Erreur: Impossible de sauvegarder les scores" << std::endl;
        return;
    }

    for (const auto& pair : highScores) {
        file << pair.first << ":" << pair.second << "\n";
    }

    file.close();
    std::cout << "Scores sauvegardés dans " << filename << std::endl;
}

int ScoreManager::getHighScore(const std::string& gameName) {
    auto it = highScores.find(gameName);
    if (it != highScores.end()) {
        return it->second;
    }
    return 0;
}

bool ScoreManager::updateHighScore(const std::string& gameName, int score) {
    int currentHigh = getHighScore(gameName);
    
    if (score > currentHigh) {
        highScores[gameName] = score;
        saveScores();
        std::cout << "🎉 NOUVEAU RECORD pour " << gameName << " : " << score << " !" << std::endl;
        return true;
    }
    
    return false;
}

void ScoreManager::resetAllScores() {
    highScores.clear();
    saveScores();
    std::cout << "Tous les scores ont été réinitialisés" << std::endl;
}

