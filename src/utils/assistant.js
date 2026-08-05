import { supabase } from './supabaseClient';

export async function askAssistant(prompt, user) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('assistant', {
      body: { prompt, user },
      headers: {
        Authorization: `Bearer ${session?.access_token ?? ''}`,
      },
    });

    if (error) {
      console.error('[Assistant] function error', error);
      return 'Désolé, je n’ai pas pu obtenir de réponse de l’assistant.';
    }

    return data?.answer || 'Désolé, je ne peux pas répondre pour le moment.';
  } catch (err) {
    console.error('[Assistant]', err);
    return 'Désolé, je rencontre un problème pour répondre à cette question.';
  }
}
