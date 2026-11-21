import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  validateGenerated,
  pickSubtopic,
  shouldSampleForReview,
  SUBTOPICS,
} from '../supabase/functions/game-master/validate.ts';

const valid = {
  question: 'Quelle planète est surnommée la planète rouge ?',
  options: ['Vénus', 'Mars', 'Jupiter', 'Saturne'],
  answer: 'Mars',
  explanation: 'Mars doit sa couleur à l’oxyde de fer.',
};

describe('normalizeText', () => {
  it('retire accents, casse et ponctuation', () => {
    expect(normalizeText('  Quelle est LA capitale, à Paris ?  ')).toBe('quelle est la capitale a paris');
  });
  it('rend identiques deux formulations ne différant que par la forme', () => {
    expect(normalizeText('Où est Paris ?')).toBe(normalizeText('ou est paris'));
  });
});

describe('validateGenerated', () => {
  it('accepte une question correcte', () => {
    const r = validateGenerated(valid);
    expect(r.ok).toBe(true);
    expect(r.value.answer).toBe('Mars');
  });

  it('refuse un nombre d’options différent de 4', () => {
    expect(validateGenerated({ ...valid, options: ['Mars', 'Vénus', 'Jupiter'] }).ok).toBe(false);
  });

  it('refuse une réponse absente des options', () => {
    expect(validateGenerated({ ...valid, answer: 'Terre' })).toEqual({ ok: false, reason: 'reponse_absente' });
  });

  it('refuse deux options identiques après normalisation', () => {
    const r = validateGenerated({ ...valid, options: ['Mars', 'mars !', 'Jupiter', 'Saturne'], answer: 'Mars' });
    expect(r).toEqual({ ok: false, reason: 'options_doublons' });
  });

  it('refuse une question qui révèle la réponse', () => {
    const r = validateGenerated({
      ...valid,
      question: 'Mars est une planète : laquelle ?',
    });
    expect(r).toEqual({ ok: false, reason: 'fuite_reponse' });
  });

  it('refuse un énoncé trop long', () => {
    expect(validateGenerated({ ...valid, question: 'x'.repeat(201) }).ok).toBe(false);
  });

  it('refuse une entrée qui n’est pas un objet', () => {
    expect(validateGenerated(null).ok).toBe(false);
    expect(validateGenerated('texte').ok).toBe(false);
  });
});

describe('diversification', () => {
  it('tire un sujet du thème demandé', () => {
    expect(SUBTOPICS.culture).toContain(pickSubtopic('culture', () => 0));
  });
  it('utilise un sujet générique pour un thème inconnu', () => {
    expect(pickSubtopic('inconnu', () => 0)).toBe('culture générale');
  });
  it('échantillonne environ 10 % des questions pour relecture', () => {
    expect(shouldSampleForReview(0.1, () => 0.05)).toBe(true);
    expect(shouldSampleForReview(0.1, () => 0.5)).toBe(false);
  });
});
