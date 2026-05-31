import React from 'react';
import SubjectCard from './SubjectCard';
import Button from '../common/Button';

export default function PresentationTopic({ topic, onStartPrep, onReroll }) {
  if (!topic) {
    return (
      <div className="text-center py-12">
        <Button onClick={onReroll}>Générer un sujet</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <SubjectCard topic={topic} />
      <div className="flex gap-4 justify-center">
        <Button variant="secondary" onClick={onReroll}>Changer de sujet</Button>
        <Button onClick={onStartPrep}>Préparer l'exposé</Button>
      </div>
    </div>
  );
}
