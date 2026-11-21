function processData(items, options = {}) {
  const [first, ...rest] = items;
  const merged = { ...options, count: items.length };
  const safeProp = options?.nested?.val ?? 100;
  const tag = `item_${first}_${safeProp}`;
  return [tag, rest.length, merged.count];
}