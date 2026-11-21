class Solution:
    def advancedFlow(self, val: int) -> str:
        count = 0
        def inner():
            nonlocal count
            count += 1
            if count == 1:
                pass
            elif count == 2:
                pass
            else:
                pass
        inner()
        inner()
        i = 0
        while i < 2:
            i += 1
        else:
            i += 10
        return f"count={count}_i={i}"
