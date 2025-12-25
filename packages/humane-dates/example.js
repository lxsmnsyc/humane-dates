import { en } from './dist/esm/development/index.mjs';

const parsed = en.parse('next friday', {
  referenceDate: new Date(),
});
console.log(parsed[0].date.toUTCString());
console.log(en.suggest('next f'));
