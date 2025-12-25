import { en } from './dist/esm/development/index.mjs';

const parsed = en.parse('next friday');
console.log(parsed);
console.log(en.suggest('next midnight'));
