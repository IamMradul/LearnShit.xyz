function labeledSearch(grid, target) {
  let found = false;
  outer: for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === target) {
        found = true;
        break outer;
      }
    }
  }
  return found;
}