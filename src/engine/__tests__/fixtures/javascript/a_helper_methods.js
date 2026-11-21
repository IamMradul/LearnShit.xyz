class Solution {
  helper(x) {
    return x * 2;
  }
  processArray(nums) {
    const res = [];
    for (let i = 0; i < nums.length; i++) {
      res.push(this.helper(nums[i]));
    }
    return res;
  }
}