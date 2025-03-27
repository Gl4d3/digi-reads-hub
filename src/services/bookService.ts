
// This file now re-exports the fixed implementation from bookServiceFixed.ts

import {
  getBooks,
  getBooksByCategory,
  getCategories,
  getNewReleases,
  getFeaturedBooks,
  searchBooks,
  getBundles,
  getBundleWithBooks,
  toggleFavorite,
  getFavorites,
  checkIsFavorite,
  getBookById,
  subscribeToMailingList,
  clearAllCaches,
  prefetchCommonData
} from './bookServiceFixed';

// Re-export all functions from the fixed implementation
export {
  getBooks,
  getBooksByCategory,
  getCategories,
  getNewReleases,
  getFeaturedBooks,
  searchBooks,
  getBundles,
  getBundleWithBooks,
  toggleFavorite,
  getFavorites,
  checkIsFavorite,
  getBookById,
  subscribeToMailingList,
  clearAllCaches,
  prefetchCommonData
};
