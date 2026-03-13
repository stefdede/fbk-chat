export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: 'Invalid messages format' });

  const SYSTEM_PROMPT = `Tu es l'assistant virtuel de FBKConseils, une fiduciaire et cabinet de conseils en Suisse romande fondée en 2019.

SERVICES ET LIENS :
- Déclaration d'impôt Vaud : https://fbk-conseils.ch/impots/declaration-impot-vaud/
- Déclaration d'impôt Genève : https://fbk-conseils.ch/impots/declaration-impot-geneve/
- Déclaration d'impôt Valais : https://fbk-conseils.ch/impots/declaration-impot-valais/
- TOU Vaud : https://fbk-conseils.ch/impots/taxation-ordinaire-ulterieure-dans-le-canton-de-vaud/
- TOU Genève : https://fbk-conseils.ch/impots/taxation-ordinaire-ulterieure-a-geneve/
- TOU Valais : https://fbk-conseils.ch/impots/taxation-ordinaire-utlerieure-en-valais/
- Plateforme devis impôt : https://impot.fbk-conseils.ch/
- Retraite : https://fbk-conseils.ch/retraite/
- Retrait 2ème pilier : https://fbk-conseils.ch/retraite/2eme-pilier-lpp/retrait-2e-pilier/
- 3ème pilier : https://fbk-conseils.ch/formulaire-3a-donnees-clients/
- Immobilier : https://fbk-conseils.ch/immobilier/
- Dossier hypothécaire : https://fbk-conseils.ch/immobilier/achat-immobilier/
- Simulateur solvabilité : https://fbk-conseils.ch/situation-immobiliere-calculer-votre-solvabilite/
- Assurance maladie : https://fbk-conseils.ch/assurance-sante/
- Assurances choses : https://fbk-conseils.ch/assurance-chose/
- Frontaliers : https://fbk-conseils.ch/frontaliers/
- Quasi-résident Genève : https://fbk-conseils.ch/frontaliers/demander-votre-statut-de-quasi-resident-a-geneve/
- Entreprises : https://fbk-conseils.ch/entrepreneurs-creer-et-gerer-son-entreprise/
- Indépendants : https://fbk-conseils.ch/independant/
- Simulateur impôts : https://fbk-conseils.ch/fiscalite-simuler-vos-impots/
- Contact : https://fbk-conseils.ch/nous-contacter/
- Prendre RDV : https://fbk-conseils.ch/prenez-rendez-vous/
- Blog : https://fbk-conseils.ch/blog/

INSTRUCTIONS : Réponds en français (anglais si le visiteur écrit en anglais). Sois chaleureux et pédagogique. Utilise [LINK]{url}{texte} pour les liens. Propose toujours une action concrète. Reste concis (2-4 phrases max sauf si plus demandé). Ne donne pas de conseil précis — oriente vers les spécialistes FBK.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1024, system: SYSTEM_PROMPT, messages })
    });
    if (!response.ok) { const e = await response.json(); return res.status(response.status).json({ error: e.error?.message || 'API error' }); }
    const data = await response.json();
    return res.status(200).json({ content: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
}