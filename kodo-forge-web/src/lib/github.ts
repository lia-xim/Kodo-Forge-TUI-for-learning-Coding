export const githubRepo = {
  owner: 'lia-xim',
  name: 'Kodo-Forge-TUI-for-learning-Coding',
  url: 'https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding',
  cloneUrl: 'https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding.git',
  issuesUrl:
    'https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding/issues',
  licenseUrl:
    'https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding/blob/main/LICENSE',
  releasesUrl:
    'https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding/releases',
  latestReleaseUrl:
    'https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding/releases/latest',
  workflowUrl:
    'https://github.com/lia-xim/Kodo-Forge-TUI-for-learning-Coding/blob/main/.agent/workflows/create-kodo-course.md',
} as const;

export function latestReleaseDownloadUrl(fileName: string): string {
  return `${githubRepo.url}/releases/latest/download/${fileName}`;
}
