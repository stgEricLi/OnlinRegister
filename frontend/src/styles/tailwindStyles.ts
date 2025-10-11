// Reusable Tailwind class strings
export const styles = {
  // Buttons
  btnPrimary:
    "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors",
  btnSecondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors",
  btnDanger:
    "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors",

  // Cards
  card: "bg-white p-6 rounded-lg shadow-md border-red-500",
  cardTitle: "text-xl font-semibold text-gray-800 mb-3",
  cardText: "text-gray-600",

  // Layout
  container: "max-w-4xl mx-auto px-4",
  containerFull: "max-w-7xl mx-auto px-4",

  // Typography
  pageTitle: "text-4xl font-bold text-gray-800 mb-6",
  pageSubtitle: "text-lg text-gray-600 mb-8",
  sectionTitle: "text-2xl font-semibold text-gray-800 mb-4",

  // Grid
  gridCols1: "grid grid-cols-1 gap-6",
  gridCols2: "grid grid-cols-1 md:grid-cols-2 gap-6",
  gridCols3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",

  // Forms
  input:
    "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  label: "block text-sm font-medium text-gray-700 mb-2",

  // Navigation
  navLink:
    "text-blue-600 hover:text-blue-800 no-underline font-medium transition-colors",
  navLinkActive:
    "text-blue-800 hover:text-blue-900 no-underline font-medium transition-colors border-b-2 border-blue-800",
};

// Style variants for different sizes
export const buttonSizes = {
  sm: "py-1 px-2 text-sm",
  md: "py-2 px-4",
  lg: "py-3 px-6 text-lg",
};

// Utility function to combine classes
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
