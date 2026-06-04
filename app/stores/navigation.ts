export const useNavigationStore = defineStore('navigation', () => {
  const items = [
    {
      label: 'Overview',
      to: '/',
    },
    {
      label: 'Applications',
      to: '/jobs',
    },
  ];

  return {
    items,
  };
});
