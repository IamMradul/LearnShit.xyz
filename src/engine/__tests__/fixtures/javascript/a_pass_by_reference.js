function reverseInPlace(arr) {
  let l = 0, r = arr.length - 1;
  while (l < r) {
    const temp = arr[l];
    arr[l] = arr[r];
    arr[r] = temp;
    l++;
    r--;
  }
  return arr;
}