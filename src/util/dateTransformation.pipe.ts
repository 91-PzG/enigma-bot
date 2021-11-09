export const dateTransformationPipe = (value: any): string => {
  let date = new Date();
  const dateOptions = {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  };

  //@ts-ignore
  return date.toLocaleDateString('de-DE', dateOptions);
};
