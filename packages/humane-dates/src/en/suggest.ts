import fuzzysearch from '../utils/fuzzy-search';
import { levenshtein } from '../utils/levehnstein';

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

const DIRECTIONAL = ['Next', 'Last', 'This'];

const IDENTIFIERS = ['in', 'at', 'on'];

const COMPLETE = ['Now'];

const COMPLETE_DATE = ['Tomorrow', 'Today', 'Yesterday'];

const COMPLETE_TIME = ['Midnight', 'Noon'];

const DATE_UNIT = ['days', 'weeks', 'months', 'years'];

const DATE_UNIT_SINGULAR = ['day', 'week', 'month', 'year'];

const TIME_UNIT = ['minutes', 'seconds', 'hours'];

const DENOMS: Record<string, [interval: number, max: number]> = {
  seconds: [5, 60],
  minutes: [5, 60],
  hours: [1, 6],
  days: [1, 6],
  weeks: [1, 3],
  months: [1, 6],
  years: [1, 5],
};

const MONTHS_DENOM: Record<string, number> = {
  January: 31,
  February: 29,
  March: 31,
  April: 30,
  May: 31,
  June: 30,
  July: 31,
  August: 31,
  September: 30,
  October: 31,
  November: 30,
  December: 31,
};

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

function populateByValue(value: string): string[] {
  const state: string[] = [];
  for (const month of MONTHS) {
    state.push(`${value} ${month}`);
    state.push(`${month} ${value}`);
  }
  for (const unit of DATE_UNIT) {
    state.push(`In ${value} ${unit}`);
    state.push(`${value} ${unit} ago`);
  }
  for (const unit of TIME_UNIT) {
    state.push(`In ${value} ${unit}`);
    state.push(`${value} ${unit} ago`);
  }
  return state;
}

function populateByDirectional(value: string): string[] {
  const state: string[] = [];
  for (const unit of COMPLETE_TIME) {
    state.push(`${value} ${unit}`);
  }
  for (const unit of DATE_UNIT_SINGULAR) {
    state.push(`${value} ${unit}`);
  }
  for (const day of DAYS) {
    state.push(`${value} ${day}`);
  }
  // Units
  return state;
}

function populateByUnit(value: string): string[] {
  const results: string[] = [];
  const [interval, max] = DENOMS[value];
  for (let i = interval; i <= max; i += interval) {
    results.push(`In ${i} ${value}`);
    results.push(`${i} ${value} ago`);
  }
  return results;
}

function populateByMonth(value: string): string[] {
  const results: string[] = [];
  for (let i = 1; i <= MONTHS_DENOM[value]; i++) {
    // results.push(`${i} ${value}`);
    results.push(`${value} ${i}`);
  }
  return results;
}

function populateByKeyword(value: string): string[] {
  const matches = measure(value, [
    ...MONTHS,
    ...DAYS,
    ...DIRECTIONAL,
    ...IDENTIFIERS,
    ...COMPLETE,
    ...COMPLETE_DATE,
    ...COMPLETE_TIME,
    ...DATE_UNIT,
    ...TIME_UNIT,
  ]);

  let state: string[] = [];

  for (const match of matches) {
    if (
      COMPLETE.includes(match) ||
      COMPLETE_DATE.includes(match) ||
      COMPLETE_TIME.includes(match)
    ) {
      state.push(match);
    }
    if (DIRECTIONAL.includes(match)) {
      state = state.concat(populateByDirectional(match));
    }
    if (DATE_UNIT.includes(match) || TIME_UNIT.includes(match)) {
      state = state.concat(populateByUnit(match));
    }
    if (MONTHS.includes(match)) {
      state = state.concat(populateByMonth(match));
    }
  }

  return [...new Set(state)];
}

const I_I = /(\w)+\s+(\w+)/i;
const N_I = /([0-9]+)\s+\w+/i;
const I_N = /\w+\s+([0-9]+)/i;
const NUMBER_ONLY = /[0-9]+/i;
const IDENTIFIER_ONLY = /\w+/i;

export function suggest(input: string): string[] {
  const result0 = I_I.exec(input);
  if (result0) {
    const [pattern, left, right] = result0;
    const results = Array.from(
      new Set([...populateByKeyword(left), ...populateByKeyword(right)]),
    );
    return measure(pattern, results);
  }

  const resultA = N_I.exec(input);
  if (resultA) {
    const [pattern, value] = resultA;
    const results = populateByValue(value);
    return measure(pattern, results);
  }

  const resultB = I_N.exec(input);
  if (resultB) {
    const [pattern, value] = resultB;
    const results = populateByValue(value);
    return measure(pattern, results);
  }

  const resultC = NUMBER_ONLY.exec(input);
  if (resultC) {
    const [value] = resultC;
    const results = populateByValue(value);
    return measure(input, results);
  }

  const resultD = IDENTIFIER_ONLY.exec(input);
  if (resultD) {
    const [value] = resultD;
    return measure(input, populateByKeyword(value));
  }

  return measure(input, populateByKeyword(input));
}
