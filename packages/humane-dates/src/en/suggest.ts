import { AST } from '../core/token';
import fuzzysearch from '../utils/fuzzy-search';
import { levenshtein } from '../utils/levehnstein';
import { categorizeForIntellisense } from './lexer';
import { tokenize } from './tokenizer';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const RELATIVE = ['before', 'after', 'from'];

const DIRECTIONAL = ['next', 'last', 'this'];

const IDENTIFIERS = ['in', 'at', 'on'];

const COMPLETE = ['now'];

const COMPLETE_DATE = ['tomorrow', 'today', 'yesterday'];

const COMPLETE_TIME = ['midnight', 'noon'];

const DATE_UNIT = ['days', 'weeks', 'months', 'years'];

const TIME_UNIT = ['minutes', 'seconds', 'hours'];

function measure(token: string, options: string[]): string[] {
  const filtered: string[] = [];
  for (let i = 0, len = options.length; i < len; i++) {
    if (fuzzysearch(token, options[i])) {
      filtered.push(options[i]);
    }
  }
  const scored: { keyword: string; value: number }[] = [];
  for (let i = 0, len = filtered.length; i < len; i++) {
    scored.push({
      keyword: filtered[i],
      value: levenshtein(token, filtered[i]),
    });
  }
  scored.sort((a, b) => a.value - b.value);

  const keywords: string[] = [];
  for (let i = 0, len = scored.length; i < len; i++) {
    keywords.push(scored[i].keyword);
  }
  return keywords;
}

function intersection(arr1: string[], arr2: string[]) {
  // 1. Create a Set from the smaller array for quick lookups using has()
  const set1 = new Set(arr1);

  // 2. Filter the second array, keeping only elements present in the Set
  const intersectArray = arr2.filter(item => set1.has(item));

  // 3. Create a new Set from the results to ensure uniqueness, then convert back to an array
  return Array.from(new Set(intersectArray));
}

function populateMonthSuffix(value: string): string[] {
  const state: string[] = [];
  for (const month of MONTHS) {
    state.push(`${month} ${value}`);
  }
  return state;
}

function populateMonthPrefix(value: string): string[] {
  const state: string[] = [];
  for (const month of MONTHS) {
    state.push(`${value} ${month}`);
  }
  return state;
}

function populateIn(value: string): string[] {
  const state: string[] = [];
  for (const unit of DATE_UNIT) {
    state.push(`In ${value} ${unit}`);
  }
  for (const unit of TIME_UNIT) {
    state.push(`In ${value} ${unit}`);
  }
  return state;
}

function populateAgo(value: string): string[] {
  const state: string[] = [];
  for (const unit of DATE_UNIT) {
    state.push(`${value} ${unit} ago`);
  }
  for (const unit of TIME_UNIT) {
    state.push(`${value} ${unit} ago`);
  }
  return state;
}

function processSequence(input: string, sequence: AST[]): string[] {
  const current = sequence[0];
  const source = input.substring(current.start, current.end);

  let state: string[] = [];

  if (current.kind === 'multi') {
    // parse N_I_I
    if (current.tag === 'n-i-i') {
    } else if (current.tag === 'i-n-i') {
    } else if (current.tag === 'i-i-n') {
    } else if (current.tag === 'n-i') {
      const amount = current.children[0];
      if (amount.kind === 'value') {
        // Do day-month
        state = state.concat(populateMonthSuffix(amount.children));
        // Do units
        state = state.concat(populateIn(amount.children));
        state = state.concat(populateAgo(amount.children));
      }
      state = measure(source, state);
    } else if (current.tag === 'i-n') {
      const amount = current.children[2];
      if (amount.kind === 'value') {
        // Do day-month
        state = state.concat(populateMonthPrefix(amount.children));
      }
      console.log(source, state);
      state = measure(source, state);
    }
  } else if (current.kind === 'solo') {
    if (current.tag === 'date-time') {
      return completeDate;
    }
  } else if (current.kind === 'value') {
  }
  return state;
}

export function suggest(input: string,): string[] {
  const tokens = tokenize(input);
  const sequence = categorizeForIntellisense(tokens);

  console.log(sequence);

  return measure(input, processSequence(input, sequence));
}
