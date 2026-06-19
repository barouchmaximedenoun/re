import baseConfig from '../../eslint.config.mjs';
import * as jsoncParser from 'jsonc-eslint-parser'; // <-- AJOUTE LE "* as" ICI
import nxPlugin from '@nx/eslint-plugin';

export default [
  ...baseConfig,
  
  {
    files: ['package.json', 'project.json'],
    languageOptions: {
      parser: jsoncParser, // Pas besoin de changer cette ligne, elle prendra tout l'objet
    },
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          buildTargets: ['build'],
          checkMissingDependencies: true,
          checkObsoleteDependencies: true,
          checkVersionMismatches: true,
          includeTransitiveDependencies: true,
          ignoredDependencies: []
        }
      ]
    }
  }
];