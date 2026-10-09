import colors from "tailwindcss/colors";

// Shared by the MathBox scene and the inverse lesson coordinate planes.
export const gridStyle = {
	cellSize: 1,
	sectionSize: 5,
	cellColor: colors.slate["700"],
	sectionColor: colors.slate["700"],
	cellThickness: 1.5,
	sectionThickness: 3
};

export const vectorWidth = 3;
export const vectorArrowSize = 3;
export const cameraFov = 50;
export const cameraDistance = 15;
export const mathboxFocus = 20;

// MathBox measures line widths against Threlte's default camera (fov 75) rather
// than the scene camera, so its nominal pixels render at this on-screen scale.
export const mathboxPixelScale =
	((mathboxFocus / cameraDistance) * Math.tan((75 * Math.PI) / 360)) /
	Math.tan((cameraFov * Math.PI) / 360);

export function pixelsPerUnit(height) {
	return height / (2 * cameraDistance * Math.tan((cameraFov * Math.PI) / 360));
}
