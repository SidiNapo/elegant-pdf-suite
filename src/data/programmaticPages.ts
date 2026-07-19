// This file is a thin, typed re-export of the single source of truth at
// `api/_programmatic.js`. The raw data lives there because the Vercel
// serverless functions in `api/` need plain ESM (no TS build step).
// Edit `api/_programmatic.js` — never duplicate the data here.
import {
  programmaticPages as _programmaticPages,
  getProgrammaticPage as _get,
} from '../../api/_programmatic.js';

export interface ProgrammaticPageLang {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  h1: string;
  intro: string;
  paragraphs: string[];
  steps: string[];
  ctaLabel: string;
}

export interface ProgrammaticPage {
  slug: string;
  /** route of the tool this page sends users to */
  toolPath: string;
  fr: ProgrammaticPageLang;
  en: ProgrammaticPageLang;
}

export const programmaticPages = _programmaticPages as ProgrammaticPage[];

export const getProgrammaticPage = (slug?: string): ProgrammaticPage | undefined =>
  _get(slug) as ProgrammaticPage | undefined;
