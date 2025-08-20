# Smart Tables - User Management

## Pagination State Management

### Issue Fixed: Pagination Reset on Row Selection

Previously, when users selected rows on page 2 (or any page other than 1), the table would automatically reset to page 1. This was a poor user experience that made it difficult to work with users across multiple pages.

### Root Cause

The `DynamicTable` component was reinitializing its pagination state on every render, including when row selection state changed. This caused the `pageIndex` to reset to the initial value.

### Solution

1. **Separated initialization from updates**: Used `useEffect` with an empty dependency array to initialize pagination state only once on component mount.

2. **Preserved page state**: Modified the pagination state management to only update `pageSize` when it actually changes, while preserving the current `pageIndex`.

3. **Prevented unnecessary resets**: Removed the automatic reset of pagination state when the component re-renders due to selection changes.

### Code Changes

```typescript
// Before (problematic)
const [pagination, setPagination] = useState({
  pageIndex: (currentPage || 1) - 1, // This reset on every render
  pageSize: enablePagination ? pageSize : data.length,
});

// After (fixed)
const [pagination, setPagination] = useState({
  pageIndex: 0, // Start with 0 initially
  pageSize: enablePagination ? pageSize : data.length,
});

// Initialize pagination only once
useEffect(() => {
  if (currentPage && currentPage > 0) {
    setPagination(prev => ({
      ...prev,
      pageIndex: currentPage - 1,
    }));
  }
}, []); // Empty dependency array - only run once

// Update pageSize when it changes, but preserve current page
useEffect(() => {
  setPagination(prev => ({
    pageIndex: prev.pageIndex, // Preserve current page
    pageSize: enablePagination ? pageSize : data.length,
  }));
}, [pageSize, enablePagination, data.length]);
```

### User Experience Improvement

- ✅ Users can now select rows on any page without being redirected to page 1
- ✅ Pagination state is preserved during row selection changes
- ✅ Page size changes still work correctly
- ✅ Initial page setting still works as expected

### Testing

To test this fix:

1. Navigate to the Users page
2. Go to page 2 (if you have enough users)
3. Select any user row
4. Verify that you remain on page 2
5. Verify that the confirmation dialog works correctly
6. Verify that after deletion, you remain on the current page (unless it becomes empty)
