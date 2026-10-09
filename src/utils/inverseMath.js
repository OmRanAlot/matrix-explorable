// cloned from repo https://github.com/yizhe-ang/matrix-explorable — original visualization by Yi Zhe Ang.
export const identity = [1, 0, 0, 1];
export const defaultMatrix = [2, 1, 0, 1];
export const inputVector = [-1, 2];
export const presets = {
	Default: defaultMatrix,
	Identity: identity,
	Shear: [1, 1, 0, 1],
	Reflection: [-1, 0, 0, 1],
	"Line collapse": [2, 1, 2, 1],
	"Point collapse": [0, 0, 0, 0]
};

// Row-major matrices: [a, b, c, d]. Normalize before testing conditioning,
// so uniformly tiny (or huge) matrices are not mistaken for singular ones.
export function analyzeMatrix(matrix) {
	const scale = Math.max(...matrix.map(Math.abs));
	if (scale === 0)
		return {
			determinant: 0,
			determinantText: "0",
			exactZero: true,
			inverse: null
		};
	const [a, b, c, d] = matrix.map((value) => value / scale);
	const normalized = a * d - b * c;
	const determinant = matrix[0] * matrix[3] - matrix[1] * matrix[2];
	const exactZero = determinant === 0;
	const unstable = Math.abs(normalized) <= 16 * Number.EPSILON;
	const inverse = unstable
		? null
		: [d, -b, -c, a].map((value) => value / normalized / scale);
	let determinantText = formatNumber(determinant);
	if (!exactZero && (determinant === 0 || !Number.isFinite(determinant))) {
		const logarithm = Math.log10(Math.abs(normalized)) + 2 * Math.log10(scale);
		const exponent = Math.floor(logarithm);
		determinantText =
			(Math.sign(normalized) * 10 ** (logarithm - exponent)).toFixed(3) +
			"e" +
			exponent;
	}
	return {
		determinant,
		determinantText,
		exactZero,
		inverse: inverse?.every(Number.isFinite) ? inverse : null
	};
}

export function transform(matrix, [x, y]) {
	return [matrix[0] * x + matrix[1] * y, matrix[2] * x + matrix[3] * y];
}

export function interpolate(from, to, t) {
	return from.map((value, i) => (1 - t) * value + t * to[i]);
}

export function formatNumber(value) {
	if (value === 0) return "0";
	if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000)
		return value.toExponential(3);
	return String(Number(value.toFixed(3)));
}
