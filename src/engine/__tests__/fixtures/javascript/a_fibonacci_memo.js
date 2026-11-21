var fib = function(n) {
  const memo = new Array(n + 1).fill(-1);
  function helper(k) {
    if (k <= 0) return 0;
    if (k === 1) return 1;
    if (memo[k] !== -1) return memo[k];
    memo[k] = helper(k - 1) + helper(k - 2);
    return memo[k];
  }
  return helper(n);
};