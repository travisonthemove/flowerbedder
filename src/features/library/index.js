import { PLANTS } from '../../data/plants.js';
import { createMetaChips, formatSeasons } from '../../utils/dom.js';

let plantListEl;
let filterSunEl;
let filterColorEl;
let filterHeightEl;
let filterQueryEl;

export function initLibrary() {
  plantListEl = document.querySelector('#plant-list');
  if (!plantListEl) {
    return;
  }

  filterSunEl = document.querySelector('#filter-sun');
  filterColorEl = document.querySelector('#filter-color');
  filterHeightEl = document.querySelector('#filter-height');
  filterQueryEl = document.querySelector('#filter-query');

  applyLibraryFilters();

  filterSunEl?.addEventListener('change', applyLibraryFilters);
  filterColorEl?.addEventListener('change', applyLibraryFilters);
  filterHeightEl?.addEventListener('change', applyLibraryFilters);
  filterQueryEl?.addEventListener('input', applyLibraryFilters);
}

function applyLibraryFilters() {
  if (!plantListEl) {
    return;
  }

  const filters = {
    sun: filterSunEl?.value ?? 'All',
    color: filterColorEl?.value ?? 'All',
    height: filterHeightEl?.value ?? 'All',
    query: (filterQueryEl?.value ?? '').trim().toLowerCase(),
  };

  const filtered = PLANTS.filter((plant) => {
    const matchesSun = filters.sun === 'All' || plant.sun === filters.sun;
    const matchesColor = filters.color === 'All' || plant.color === filters.color;
    const matchesHeight = filters.height === 'All' || plant.height === filters.height;
    const matchesQuery =
      !filters.query ||
      [
        plant.name,
        plant.botanicalName,
        plant.description,
        plant.notes,
        plant.focus.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(filters.query);

    return matchesSun && matchesColor && matchesHeight && matchesQuery;
  }).sort((a, b) => a.name.localeCompare(b.name));

  renderPlantLibrary(filtered);
}

function renderPlantLibrary(plants) {
  plantListEl.innerHTML = '';

  if (!plants.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent =
      'No plants match these filters yet. Try adjusting one of your selections.';
    empty.style.gridColumn = '1 / -1';
    plantListEl.append(empty);
    return;
  }

  plants.forEach((plant) => {
    plantListEl.append(createPlantCard(plant));
  });
}

function createPlantCard(plant) {
  const card = document.createElement('article');
  card.className = 'plant-card';

  const title = document.createElement('h4');
  title.textContent = plant.name;
  card.append(title);

  const description = document.createElement('p');
  description.className = 'plant-notes';
  description.textContent = plant.description;
  card.append(description);

  const chips = [
    plant.sun,
    `Bloom: ${formatSeasons(plant.bloom)}`,
    `Height: ${plant.height}`,
    `Color: ${plant.color}`,
    ...plant.focus,
  ];
  const meta = createMetaChips(chips);
  if (meta) {
    card.append(meta);
  }

  if (plant.notes) {
    const note = document.createElement('p');
    note.className = 'plant-notes';
    note.textContent = plant.notes;
    card.append(note);
  }

  return card;
}
