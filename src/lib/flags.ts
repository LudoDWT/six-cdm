/**
 * Code pays (flag-icons / ISO 3166-1 alpha-2, sous-divisions GB pour Angleterre
 * et Écosse) par nom d'équipe FR. Les libellés de placeholder de phase finale
 * (« 1er Groupe A », « Vainqueur M73 », « 3e (A/B/...) »…) renvoient null.
 */
const CODES: Record<string, string> = {
  'Afrique du Sud': 'za',
  Algérie: 'dz',
  Allemagne: 'de',
  Angleterre: 'gb-eng',
  'Arabie Saoudite': 'sa',
  Argentine: 'ar',
  Australie: 'au',
  Autriche: 'at',
  Belgique: 'be',
  'Bosnie-Herzégovine': 'ba',
  Brésil: 'br',
  Canada: 'ca',
  'Cap-Vert': 'cv',
  Colombie: 'co',
  Croatie: 'hr',
  Curaçao: 'cw',
  "Côte d'Ivoire": 'ci',
  Espagne: 'es',
  France: 'fr',
  Ghana: 'gh',
  Haïti: 'ht',
  Irak: 'iq',
  Iran: 'ir',
  Japon: 'jp',
  Jordanie: 'jo',
  Maroc: 'ma',
  Mexique: 'mx',
  Norvège: 'no',
  'Nouvelle-Zélande': 'nz',
  Ouzbékistan: 'uz',
  Panamá: 'pa',
  Paraguay: 'py',
  'Pays-Bas': 'nl',
  Portugal: 'pt',
  Qatar: 'qa',
  'RD Congo': 'cd',
  'République de Corée': 'kr',
  Suisse: 'ch',
  Suède: 'se',
  Sénégal: 'sn',
  Tchéquie: 'cz',
  Tunisie: 'tn',
  Turquie: 'tr',
  Uruguay: 'uy',
  Écosse: 'gb-sct',
  Égypte: 'eg',
  Équateur: 'ec',
  'États-Unis': 'us',
}

/** Renvoie le code pays flag-icons d'une équipe, ou null pour un placeholder. */
export function teamCountryCode(team: string): string | null {
  return CODES[team] ?? null
}
