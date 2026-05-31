export const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .trim();
};

export const checkWordMatch = (input, target) => {
  return normalizeText(input) === normalizeText(target);
};
