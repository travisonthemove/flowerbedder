export function createMetaChips(values) {
  const filtered = values.filter(Boolean);
  if (!filtered.length) {
    return null;
  }

  const meta = document.createElement('div');
  meta.className = 'plant-meta';

  filtered.forEach((value) => {
    const chip = document.createElement('span');
    chip.textContent = value;
    meta.append(chip);
  });

  return meta;
}

export function formatSeasons(seasons) {
  if (!seasons || !seasons.length) {
    return 'Unknown';
  }
  if (seasons.length === 1) {
    return seasons[0];
  }
  if (seasons.length === 2) {
    return `${seasons[0]} & ${seasons[1]}`;
  }
  return `${seasons.slice(0, -1).join(', ')} & ${seasons.slice(-1)}`;
}
