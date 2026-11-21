function crashMidway(nums) {
  const result = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0) {
      throw new Error("Negative number encountered");
    }
    result.push(nums[i] * 2);
  }
  return result;
}