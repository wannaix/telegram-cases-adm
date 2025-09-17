import React from 'react';
import styles from './LoadingSpinner.module.css';
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circle' | 'gradient' | 'pulse';
  className?: string;
}
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'gradient',
  className = '' 
}) => {
  const sizeClasses = {
    sm: styles.small,
    md: styles.medium,
    lg: styles.large
  };
  const variantClasses = {
    circle: styles.spinnerCircle,
    gradient: styles.spinnerGradient,
    pulse: styles.pulseSpinner
  };
  return (
    <div className={`${styles.spinner} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} />
  );
};