var permute = function(nums) {
  const res = [];
  function backtrack(start) {
    if (start === nums.length) {
      res.push([...nums]);
      return;
    }
    for (let i = start; i < nums.length; i++) {
      const temp = nums[start];
      nums[start] = nums[i];
      nums[i] = temp;
      backtrack(start + 1);
      const temp2 = nums[start];
      nums[start] = nums[i];
      nums[i] = temp2;
    }
  }
  backtrack(0);
  return res;
};