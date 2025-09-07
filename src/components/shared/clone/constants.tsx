// Global spotlight configuration
export const SPOTLIGHT_RADIUS = 1.5; // Full visibility radius around character
export const FADE_RADIUS = 5; // Complete fade/transparency radius

// Path specific visibility (larger than ground plane)
export const PATH_SPOTLIGHT_RADIUS = 0.5; // Path stays visible longer
export const PATH_FADE_RADIUS = 10; // Path fades over larger radius

// Global color configuration
export const GROUND_COLOR = "#94BF8E"; // Light green/yellow ground color
export const GRASS_COLOR = "#9FC99A"; // Medium green grass color
export const PATH_COLOR = "#D5D5D5"; // Light grey path color

// World configuration
export const WORLD_WIDTH = 5; // Total world width/depth
export const WORLD_BOUNDARY_GRASS_WIDTH = 1; // Width of grass around world edges

// Path configuration
export const PATH_WIDTH = 1; // Width of the walking path
export const PATH_START_Z = -5; // Starting Z position (where character starts)
export const PATH_END_Z = 1; // Ending Z position (where character ends)
export const PATH_START_X = -3; // Starting X position (back left)
export const PATH_END_X = 0; // Ending X position (center front)

// Curved path control points for natural curve
export const PATH_CONTROL_X = -1; // Bezier control point X
export const PATH_CONTROL_Z = -2; // Bezier control point Z

// Helper function to convert hex to RGB array for shaders
export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [1, 1, 1];
};

// Helper function to calculate curved path position using quadratic bezier
export const getCurvedPathPosition = (t: number): { x: number; z: number } => {
  // Quadratic bezier curve: P(t) = (1-t)²P₀ + 2(1-t)tP₁ + t²P₂
  const oneMinusT = 1 - t;
  const x = oneMinusT * oneMinusT * PATH_START_X + 
            2 * oneMinusT * t * PATH_CONTROL_X + 
            t * t * PATH_END_X;
  const z = oneMinusT * oneMinusT * PATH_START_Z + 
            2 * oneMinusT * t * PATH_CONTROL_Z + 
            t * t * PATH_END_Z;
  return { x, z };
};
