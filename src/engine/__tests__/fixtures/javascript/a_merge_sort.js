var sortArray = function(nums) {
  function merge(arr, l, m, r) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) arr[k++] = left[i++];
      else arr[k++] = right[j++];
    }
    while (i < left.length) arr[k++] = left[i++];
    while (j < right.length) arr[k++] = right[j++];
  }
  function sort(arr, l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    sort(arr, l, m);
    sort(arr, m + 1, r);
    merge(arr, l, m, r);
  }
  sort(nums, 0, nums.length - 1);
  return nums;
};