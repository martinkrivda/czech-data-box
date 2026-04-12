function normalizeSummary(summary) {
  const trimmed = summary.trim();

  if (trimmed.length === 0) {
    return '- Internal maintenance changes.';
  }

  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => (line.startsWith('-') ? line : `- ${line}`))
    .join('\n');
}

async function getReleaseLine(changeset, type) {
  return `### ${type}\n\n${normalizeSummary(changeset.summary)}\n`;
}

async function getDependencyReleaseLine(changesets, dependenciesUpdated) {
  if (dependenciesUpdated.length === 0) {
    return '';
  }

  const dependencyList = dependenciesUpdated
    .map((dependency) => `\`${dependency.name}\` to \`${dependency.newVersion}\``)
    .join(', ');

  const relatedChangesets = changesets
    .map((changeset) => changeset.summary.trim())
    .filter((summary) => summary.length > 0)
    .map((summary) => `- ${summary}`)
    .join('\n');

  const dependencyLine = `- Updated dependencies: ${dependencyList}`;

  if (relatedChangesets.length === 0) {
    return `${dependencyLine}\n`;
  }

  return `${dependencyLine}\n${relatedChangesets}\n`;
}

module.exports = {
  getDependencyReleaseLine,
  getReleaseLine,
};
