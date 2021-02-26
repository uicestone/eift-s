export default (orderString?: string): Record<string, number> | undefined => {
  if (!orderString) {
    return;
  }

  const sort = orderString.split(",").reduce((acc, seg) => {
    const matches = seg.match(/^(-?)(.*)$/);
    if (!matches) return acc;
    acc[matches[2]] = matches[1] === "-" ? -1 : 1;
    return acc;
  }, {} as Record<string, number>);

  return sort;
};
