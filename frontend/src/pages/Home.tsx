import React from "react";
import { styles, cn } from "../styles/tailwindStyles";
import { useButtonStyles, useCardStyles } from "../hooks/useStyles";

const Home: React.FC = () => {
  // Using custom hooks for dynamic styles

  const primaryButtonStyles = useButtonStyles({
    variant: "primary",
    size: "md",
  });
  const secondaryButtonStyles = useButtonStyles({
    variant: "secondary",
    size: "sm",
  });
  const cardStyles = useCardStyles(true); // elevated card

  return (
    <div className={styles.container}>
      {/* Using CSS classes from components.css */}
      <h1 className="page-title">Home Page</h1>
      <p className="page-subtitle">Welcome to the home page!</p>

      <div className={styles.gridCols3}>
        {/* Using CSS class in components.css*/}
        <div className="card">
          <h3 className="card-title">Feature 1</h3>
          <p className="card-text">
            This card uses CSS @apply classes for reusable styles.
          </p>
        </div>

        {/* Using TypeScript style object */}
        <div className="card">
          <h3 className={styles.cardTitle}>Feature 2</h3>
          <p className={styles.cardText}>
            This card uses TypeScript style objects.
          </p>
        </div>

        {/* Using custom hook */}
        <div className={cardStyles}>
          <h3 className={styles.cardTitle}>Feature 3</h3>
          <p className={styles.cardText}>
            This card uses a custom hook for dynamic styles.
          </p>
        </div>
      </div>

      <div className="mt-8 space-x-4">
        {/* Using CSS class */}
        <button className="btn-primary">CSS Class Button</button>

        {/* Using TypeScript style */}
        <button className={styles.btnSecondary}>TS Style Button</button>

        {/* Using custom hook */}
        <button className={primaryButtonStyles}>Hook Button</button>

        {/* Combining styles with cn utility */}
        <button className={cn(secondaryButtonStyles, "ml-2")}>
          Combined Styles
        </button>
      </div>
    </div>
  );
};

export default Home;
