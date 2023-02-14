export const formatDate = (date: Date): string => {
  return date.toJSON().slice(0, 10).split('-').reverse().join('.');
};
