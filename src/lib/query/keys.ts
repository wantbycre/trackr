// TanStack Query 캐시 키 팩토리 (react.md §5 규약)
export const keys = {
  applications: () => ['applications'] as const,
  application: (id: string) => ['applications', id] as const,
  events: (appId: string) => ['applications', appId, 'events'] as const,
  stats: () => ['stats'] as const,
};
