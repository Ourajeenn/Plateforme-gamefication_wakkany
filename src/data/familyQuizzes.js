export const FAMILY_THEMES = [
  { id: 'culture', name: 'Culture Générale', icon: 'lucide:globe', color: 'bg-blue-500' },
  { id: 'cinema', name: 'Films & Séries', icon: 'lucide:film', color: 'bg-purple-500' },
  { id: 'animaux', name: 'Animaux', icon: 'lucide:cat', color: 'bg-green-500' },
  { id: 'sport', name: 'Sport', icon: 'lucide:trophy', color: 'bg-orange-500' },
  { id: 'musique', name: 'Musique', icon: 'lucide:music', color: 'bg-pink-500' }
];

export const FAMILY_QUESTIONS = [
  // Culture Générale
  {
    id: 'c1',
    theme: 'culture',
    question: 'Combien y a-t-il de continents sur Terre ?',
    options: ['5', '6', '7', '8'],
    answer: '7'
  },
  {
    id: 'c2',
    theme: 'culture',
    question: "Quelle est la capitale de l'Australie ?",
    options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'],
    answer: 'Canberra'
  },
  {
    id: 'c3',
    theme: 'culture',
    question: 'Qui a peint La Joconde ?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Léonard de Vinci', 'Claude Monet'],
    answer: 'Léonard de Vinci'
  },
  // Cinema
  {
    id: 'm1',
    theme: 'cinema',
    question: `Dans "Le Roi Lion", comment s'appelle le père de Simba ?`,
    options: ['Scar', 'Mufasa', 'Timon', 'Zazu'],
    answer: 'Mufasa'
  },
  {
    id: 'm2',
    theme: 'cinema',
    question: 'Quel super-héros a pour identité secrète Peter Parker ?',
    options: ['Batman', 'Superman', 'Iron Man', 'Spider-Man'],
    answer: 'Spider-Man'
  },
  {
    id: 'm3',
    theme: 'cinema',
    question: "Comment s'appelle l'ogre vert qui vit dans un marais ?",
    options: ['Hulk', 'Shrek', 'Yoda', 'Grinch'],
    answer: 'Shrek'
  },
  // Animaux
  {
    id: 'a1',
    theme: 'animaux',
    question: 'Quel est le plus grand mammifère terrestre ?',
    options: ["L'éléphant", 'La girafe', 'Le rhinocéros', "L'hippopotame"],
    answer: "L'éléphant"
  },
  {
    id: 'a2',
    theme: 'animaux',
    question: 'Combien de pattes a une araignée ?',
    options: ['6', '8', '10', '12'],
    answer: '8'
  },
  {
    id: 'a3',
    theme: 'animaux',
    question: 'Quel oiseau est connu pour ne pas savoir voler mais nager très vite ?',
    options: ["L'autruche", 'Le kiwi', 'Le manchot', 'Le pélican'],
    answer: 'Le manchot'
  },
  // Sport
  {
    id: 's1',
    theme: 'sport',
    question: 'Quelle équipe de football a remporté la Coupe du Monde 2018 ?',
    options: ['Brésil', 'Allemagne', 'France', 'Croatie'],
    answer: 'France'
  },
  {
    id: 's2',
    theme: 'sport',
    question: 'Combien de joueurs y a-t-il dans une équipe de basket sur le terrain ?',
    options: ['5', '6', '7', '11'],
    answer: '5'
  },
  {
    id: 's3',
    theme: 'sport',
    question: 'Dans quel sport utilise-t-on un "birdie" (volant) ?',
    options: ['Tennis', 'Badminton', 'Golf', 'Ping-pong'],
    answer: 'Badminton'
  },
  // Musique
  {
    id: 'mu1',
    theme: 'musique',
    question: 'Qui est surnommé le Roi de la Pop ?',
    options: ['Elvis Presley', 'Prince', 'Michael Jackson', 'Justin Bieber'],
    answer: 'Michael Jackson'
  },
  {
    id: 'mu2',
    theme: 'musique',
    question: 'Combien de cordes a généralement une guitare classique ?',
    options: ['4', '5', '6', '12'],
    answer: '6'
  },
  {
    id: 'mu3',
    theme: 'musique',
    question: 'Quel instrument joue Ludwig van Beethoven ?',
    options: ['Violon', 'Flûte', 'Piano', 'Guitare'],
    answer: 'Piano'
  }
];
