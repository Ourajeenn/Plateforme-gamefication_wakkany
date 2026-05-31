export const calculateSpellingScore = (wordLength, timeRemaining, difficultyMultiplier) => {
  const baseScore = wordLength * 10;
  const timeBonus = timeRemaining * 2;
  return (baseScore + timeBonus) * difficultyMultiplier;
};

export const calculatePresentationScore = (durationSeconds, keywordsUsedCount) => {
  // Simple scoring logic for presentations
  return (durationSeconds / 60) * 50 + (keywordsUsedCount * 20);
};
