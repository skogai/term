import catppuccinMocha from './catppuccin-mocha.js';
import crt from './crt.js';
import dracula from './dracula.js';
import espresso from './espresso.js';
import graphite from './graphite.js';
import gruvbox from './gruvbox.js';
import matrix from './matrix.js';
import nord from './nord.js';
import skogai from './skogai.js';
import synthwave from './synthwave.js';
import tokyoNight from './tokyo-night.js';

export type Theme = {
  name: string;
  describe: string;
  css: string;
  backgroundImage?: string;
  overlayBackground?: string;
  overlayBlur?: string;
};

export const DEFAULT_THEME = 'skogai';

export const themes: Theme[] = [
  skogai,
  tokyoNight,
  crt,
  dracula,
  synthwave,
  matrix,
  nord,
  gruvbox,
  catppuccinMocha,
  graphite,
  espresso,
];
