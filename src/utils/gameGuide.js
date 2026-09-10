const GAME_TERMS = {
  'akméda': 'Akméda : le héros. Ce nom désigne un héros.',
  'akmeda': 'Akméda : le héros. Ce nom désigne un héros.',
  'famille': 'Quiz Famille : un quiz rapide en équipe pour jouer entre proches ou amis.',
  'bluff royal': 'Bluff Royal : un mode où vous répondez ou bluffez une proposition et identifiez les réponses des autres.',
  'histoire': 'Histoire : un thème historique dans le monde Wakkany.',
  'science': 'Science : un thème de questions sur la connaissance scientifique et les découvertes.',
  'culture générale': 'Culture générale : un thème ouvert sur les arts, les civilisations et les repères culturels.',
  'univers rpg': 'Univers RPG : le thème de mythes, héros, pouvoirs et quêtes du monde Wakkany.',
  'arène': 'L’Arène du Savoir est la zone de quiz où vous jouez une partie et gagnez des points.',
  'score': 'Le score s’incrémente lorsque les réponses sont justes. Les quêtes, niveaux et badges se débloquent ensuite.',
  'quête': 'Une quête décrit une mission du jeu : réponse, défi, bonus ou parcours de progression.',
  'badge': 'Un badge récompense une réussite ou une spécialisation dans le parcours du joueur.',
};

const GAME_RULES = [
  {
    pattern: /(comment|quoi|que|qui|où|quand|pourquoi|quelle|combien).*jouer|jouer.*(comment|question|quiz|jeu)|comment.*(commencer|partir|début)/i,
    answer: 'Pour jouer, choisissez un mode, choisissez un thème, puis répondez aux questions. Les bonnes réponses rapportent des points et débloquent les quêtes.'
  },
  {
    pattern: /(mode|multijoueur|salle|rejoindre|créer).*salle|rejoindre.*code|créer.*code|salle.*(code|ami|amis)/i,
    answer: 'Le multijoueur est un mode de salle. Créez une salle pour obtenir un code, puis invitez un autre joueur à le rejoindre.'
  },
  {
    pattern: /(bluff|royal|bluff royal)/i,
    answer: 'Bluff Royal invite à répondre ou à bluffer une proposition. Le but est de déjouer les autres joueurs et de gagner des points.'
  },
  {
    pattern: /(famille|quiz famille|équipe|équipes)/i,
    answer: 'Quiz Famille propose un quiz rapide en équipe depuis le mode familial et collaboratif.'
  },
  {
    pattern: /(thème|histoire|science|culture générale|culture|rpg|univers)/i,
    answer: 'Les thèmes du jeu sont : Univers RPG, Histoire, Science et Culture générale. Choisissez le thème qui correspond au défi que vous voulez tenter.'
  },
  {
    pattern: /(score|point|xp|niveau|palier|classement|récompense|badge|quête|quêtes)/i,
    answer: 'Répondez correctement pour gagner des points et faire monter votre niveau. Les quêtes et badges récompensent vos progrès.'
  },
  {
    pattern: /(arène|savoir|règle|règles|début|didacticiel|nouveau|nouveau utilisateur|guide|tutoriel)/i,
    answer: 'Le didacticiel vous aide à commencer : choisissez un mode, un thème, répondez, puis suivez les quêtes pour découvrir les récompenses.'
  }
];

export function answerGameQuestion(prompt = '', user = {}) {
  const text = String(prompt || '').trim().toLowerCase();
  if (!text) {
    return 'Bienvenue dans l’Arène du Savoir : choisissez un mode, puis un thème pour débuter la partie.';
  }

  for (const [term, explanation] of Object.entries(GAME_TERMS)) {
    if (text.includes(term)) {
      return explanation;
    }
  }

  for (const rule of GAME_RULES) {
    if (rule.pattern.test(text)) {
      return rule.answer;
    }
  }

  const userName = user?.name || 'aventurier';
  return `Bienvenue ${userName} : le jeu repose sur un thème, un mode et des réponses rapides. Choisis un thème, réponds à la question et progresse dans la quête pour gagner des points.`;
}
