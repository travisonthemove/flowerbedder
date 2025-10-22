import { PLANTS } from '../../data/plants.js';
import { createMetaChips, formatSeasons } from '../../utils/dom.js';

let discoverFormEl;
let discoverResultsEl;
let discoverRandomBtn;
let discoverSeasonEl;
let discoverSunEl;
let discoverHeightEl;
let discoverColorEl;
let discoverFocusEl;

export function initDiscover() {
  discoverFormEl = document.querySelector('#discover-form');
  discoverResultsEl = document.querySelector('#discover-results');
  discoverRandomBtn = document.querySelector('#discover-random');
  discoverSeasonEl = document.querySelector('#discover-season');
  discoverSunEl = document.querySelector('#discover-sun');
  discoverHeightEl = document.querySelector('#discover-height');
  discoverColorEl = document.querySelector('#discover-color');
  discoverFocusEl = document.querySelector('#discover-focus');

  if (!discoverFormEl || !discoverResultsEl) {
    return;
  }

  discoverFormEl.addEventListener('change', () => renderDiscover());
  discoverFormEl.addEventListener('input', () => renderDiscover());
  discoverRandomBtn?.addEventListener('click', () => {
    const filters = getDiscoverFilters();
    const matches = findDiscoverMatches(filters);
    const pool = matches.length
      ? matches
      : PLANTS.map((plant) => ({
          plant,
          score: plant.baseScore ?? 1,
          matchScore: 0,
          reasons: [],
        }));
    const pick = pool[Math.floor(Math.random() * pool.length)];
    renderDiscover({
      highlight: pick.plant,
      highlightLabel: 'Spotlight pick',
      highlightReason:
        pick.matchScore > 0
          ? 'Hand-picked from your matches'
          : 'A versatile crowd-pleaser',
    });
  });

  renderDiscover();
}

function renderDiscover(options = {}) {
  if (!discoverResultsEl) {
    return;
  }

  const filters = getDiscoverFilters();
  const { highlight, highlightLabel, highlightReason } = options;
  const matches = findDiscoverMatches(filters);
  const capped = [...matches];

  if (highlight) {
    const existingIndex = capped.findIndex((item) => item.plant.id === highlight.id);
    if (existingIndex >= 0) {
      const item = capped.splice(existingIndex, 1)[0];
      if (highlightReason && !item.reasons.includes(highlightReason)) {
        item.reasons.push(highlightReason);
      }
      capped.unshift(item);
    } else {
      capped.unshift({
        plant: highlight,
        score: (highlight.baseScore ?? 1) + 1,
        matchScore: 0,
        reasons: highlightReason ? [highlightReason] : [],
      });
    }
  }

  const trimmed = capped.slice(0, 6);

  discoverResultsEl.innerHTML = '';

  if (!trimmed.length) {
    const empty = document.createElement('div');
    empty.className = 'discover-empty';
    empty.textContent =
      'No strong matches yet. Try expanding a filter or tap "Surprise me" for inspiration.';
    empty.style.gridColumn = '1 / -1';
    discoverResultsEl.append(empty);
    return;
  }

  trimmed.forEach((item, index) => {
    const card = createDiscoverCard(item.plant, item.matchScore, item.reasons ?? []);

    if (highlight && item.plant.id === highlight.id && highlightLabel) {
      addBadge(card, highlightLabel);
    } else if (index === 0 && item.matchScore > 0) {
      addBadge(card, 'Best match');
    }

    discoverResultsEl.append(card);
  });
}

function createDiscoverCard(plant, matchScore, reasons) {
  const card = document.createElement('article');
  card.className = 'discover-card';

  const title = document.createElement('h4');
  title.textContent = plant.name;
  card.append(title);

  const description = document.createElement('p');
  description.className = 'plant-notes';
  description.textContent = plant.description;
  card.append(description);

  const meta = createMetaChips([
    plant.sun,
    `Bloom: ${formatSeasons(plant.bloom)}`,
    `Height: ${plant.height}`,
    `Color: ${plant.color}`,
  ]);
  if (meta) {
    card.append(meta);
  }

  if (plant.notes) {
    const note = document.createElement('p');
    note.className = 'plant-notes';
    note.textContent = plant.notes;
    card.append(note);
  }

  const strength = describeMatchScore(matchScore);
  if (strength) {
    const strengthLine = document.createElement('p');
    strengthLine.className = 'match-detail';
    strengthLine.textContent = strength;
    card.append(strengthLine);
  }

  if (reasons.length) {
    const reasonLine = document.createElement('p');
    reasonLine.className = 'match-detail';
    reasonLine.textContent = `Why it fits: ${reasons.join(' | ')}`;
    card.append(reasonLine);
  }

  return card;
}

function getDiscoverFilters() {
  return {
    season: discoverSeasonEl?.value ?? 'Any',
    sun: discoverSunEl?.value ?? 'Any',
    height: discoverHeightEl?.value ?? 'Any',
    color: discoverColorEl?.value ?? 'Any',
    focus: discoverFocusEl?.value ?? 'Any',
  };
}

function findDiscoverMatches(filters) {
  const allOpen = Object.values(filters).every((value) => value === 'Any');

  const scored = PLANTS.map((plant) => {
    const result = scorePlantForDiscover(plant, filters);
    return {
      plant,
      ...result,
    };
  }).sort((a, b) => {
    if (b.score === a.score) {
      return (b.plant.baseScore ?? 0) - (a.plant.baseScore ?? 0);
    }
    return b.score - a.score;
  });

  const matches = scored.filter((item) => item.matchScore > 0);

  if (matches.length) {
    return matches.slice(0, 6);
  }

  return allOpen ? scored.slice(0, 6) : scored.slice(0, 4);
}

function scorePlantForDiscover(plant, filters) {
  const weights = {
    season: 4,
    sun: 3,
    height: 2,
    color: 2,
    focus: 2,
  };

  let matchScore = 0;
  const reasons = [];

  if (filters.season !== 'Any') {
    if (plant.bloom.includes(filters.season)) {
      matchScore += weights.season;
      reasons.push(`Blooms in ${filters.season.toLowerCase()}`);
    }
  }

  if (filters.sun !== 'Any') {
    if (plant.sun === filters.sun) {
      matchScore += weights.sun;
      reasons.push(`${filters.sun} ready`);
    }
  }

  if (filters.height !== 'Any') {
    if (plant.height === filters.height) {
      matchScore += weights.height;
      reasons.push(`${filters.height.toLowerCase()} height layer`);
    }
  }

  if (filters.color !== 'Any') {
    if (plant.color === filters.color) {
      matchScore += weights.color;
      reasons.push(`${filters.color.toLowerCase()} palette`);
    }
  }

  if (filters.focus !== 'Any') {
    if (plant.focus.includes(filters.focus)) {
      matchScore += weights.focus;
      const focusLabel = focusReasonLabel(filters.focus);
      reasons.push(focusLabel);
    }
  }

  const score = matchScore + (plant.baseScore ?? 1);

  return { score, matchScore, reasons };
}

function focusReasonLabel(focus) {
  switch (focus) {
    case 'Pollinator':
      return 'Pollinator magnet';
    case 'Drought':
      return 'Handles dry spells';
    case 'Cut':
      return 'Great for cutting';
    case 'Fragrant':
      return 'Fragrance friendly';
    default:
      return focus;
  }
}

function addBadge(card, label) {
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = label;
  card.prepend(badge);
}

function describeMatchScore(matchScore) {
  if (matchScore >= 11) {
    return 'Match strength: standout';
  }
  if (matchScore >= 7) {
    return 'Match strength: strong';
  }
  if (matchScore >= 4) {
    return 'Match strength: solid';
  }
  if (matchScore >= 2) {
    return 'Match strength: worth exploring';
  }
  return '';
}
