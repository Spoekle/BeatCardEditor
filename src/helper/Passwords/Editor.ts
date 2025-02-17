export const generateMapCardJSON = (cardState: any) => {
  // Adjust transformation if needed before exporting.
  return JSON.stringify(cardState, null, 2);
};
