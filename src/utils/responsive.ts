/**
 * Responsive design utilities for phone vs tablet layouts
 */
import { Dimensions, ScaledSize } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints
export const BREAKPOINTS = {
  tablet: 600, // Width threshold for tablet
  largeTablet: 900,
} as const;

/**
 * Check if device is a tablet based on screen width
 */
export const isTablet = (): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS.tablet;
};

/**
 * Check if device is a large tablet
 */
export const isLargeTablet = (): boolean => {
  return SCREEN_WIDTH >= BREAKPOINTS.largeTablet;
};

/**
 * Get current screen dimensions
 */
export const getScreenDimensions = (): ScaledSize => {
  return Dimensions.get('window');
};

/**
 * Responsive value: returns different values for phone vs tablet
 */
export const responsiveValue = <T>(phoneValue: T, tabletValue: T): T => {
  return isTablet() ? tabletValue : phoneValue;
};

/**
 * Responsive number: scales value based on screen width
 */
export const responsiveNumber = (phoneValue: number, tabletValue: number): number => {
  return isTablet() ? tabletValue : phoneValue;
};

export default {
  isTablet,
  isLargeTablet,
  getScreenDimensions,
  responsiveValue,
  responsiveNumber,
  BREAKPOINTS,
};
