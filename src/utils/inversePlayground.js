// cloned from repo https://github.com/yizhe-ang/matrix-explorable — original visualization by Yi Zhe Ang.
import {
	analyzeMatrix,
	defaultMatrix,
	formatNumber,
	identity,
	inputVector,
	interpolate,
	presets,
	transform
} from "./inverseMath.js";

import {
	colorX as pink,
	colorY as purple,
	colorVector as cyan,
	colorGrid,
	colorGridAlt,
	colorB3,
	colorIn
} from "$data/variables";
import {
	gridStyle,
	vectorWidth,
	vectorArrowSize,
	mathboxPixelScale,
	pixelsPerUnit
} from "$data/visualization.js";
import { formatCoord } from "$utils";
import katex from "katex";
const pair = (vector) => "(" + vector.map(formatNumber).join(", ") + ")";

export function createInversePlayground(root, { introductory = false } = {}) {
	root.innerHTML = `
  <div class="inverse-decoration" aria-hidden="true"></div>
  
  <canvas aria-label="Matrix transformation coordinate plane. Edit the matrix entries below as an alternative to dragging basis vectors."></canvas>
  <div class="inverse-labels" aria-hidden="true"></div>
  <div class="inverse-controls">
   <div class="inverse-editor">
    <fieldset class="inverse-matrix" aria-label="Transformation matrix">
     <input type="number" step="any" aria-label="a, row 1 column 1" />
     <input type="number" step="any" aria-label="b, row 1 column 2" />
     <input type="number" step="any" aria-label="c, row 2 column 1" />
     <input type="number" step="any" aria-label="d, row 2 column 2" />
    </fieldset>
    <fieldset class="inverse-input-vector" aria-label="Input vector">
     <input type="number" step="any" aria-label="Input vector x" />
     <input type="number" step="any" aria-label="Input vector y" />
    </fieldset>
    <span class="inverse-equals">=</span>
    <div class="inverse-output-vector" aria-label="Transformed vector"></div>
   </div>
   <label class="inverse-presets">Preset<select aria-label="Matrix preset">${Object.keys(
			presets
		)
			.map((name) => "<option>" + name + "</option>")
			.join("")}<option value="Custom" disabled>Custom</option></select></label>
   <div class="inverse-readouts">
    <p class="inverse-determinant"></p>
    <div class="inverse-numerical"><span>A⁻¹ =</span><div class="inverse-values" aria-label="Numerical inverse"></div></div>
    <p class="inverse-vector-values"></p>
   </div>
   <div class="inverse-buttons">
    <button type="button" data-action="apply">Apply Transformation</button>
    <button type="button" data-action="inverse">Animate Inverse</button>
    <button type="button" data-action="reset">Reset</button>
   </div>
   <p class="inverse-status" role="status" aria-live="polite"></p>
   <a class="inverse-why" href="#determinant-lesson">Why can’t this be undone?</a>
   <p class="inverse-help">Left-drag a pink or purple endpoint, or edit A. Right-drag to pan. When endpoints overlap, click again to select the other one.</p>
  </div>
 `;
	const canvas = root.querySelector("canvas");
	const context = canvas.getContext("2d");
	const labelLayer = root.querySelector(".inverse-labels");
	let labels = [];
	const inputs = [...root.querySelectorAll("input")];
	const select = root.querySelector("select");
	const action = (name) => root.querySelector('[data-action="' + name + '"]');
	const status = root.querySelector(".inverse-status");
	const media = window.matchMedia("(prefers-reduced-motion: reduce)");
	const listeners = [];
	const listen = (target, event, callback, options) => {
		target.addEventListener(event, callback, options);
		listeners.push(() => target.removeEventListener(event, callback, options));
	};
	let matrix = [...defaultMatrix];
	let vector = [...inputVector];
	let shown = [...matrix];
	let scene = introductory ? "intro" : "formula";
	let demoMatrix = [...defaultMatrix];
	let active = false;
	let inverseRevealed = false;
	let phase = "transformed";
	let playing = false;
	let frame = 0;
	let finishAnimation = null;
	let width = 1,
		height = 1,
		unit = 50;
	let pan = [0, 0];
	let drag = null;
	let lastHandle = 1;
	let validation = "";
	let interactive = false;
	let playgroundSnapshot = null;
	const selected = () => (interactive ? matrix : demoMatrix);
	const selectedVector = () => (interactive ? vector : inputVector);
	const values = () => [...matrix, ...vector];
	const editable = () =>
		interactive && (scene === "intro" || scene === "formula");
	const screen = ([x, y]) => [
		width / 2 + pan[0] + x * unit,
		height / 2 + pan[1] - y * unit
	];
	const world = ([x, y]) => [
		(x - width / 2 - pan[0]) / unit,
		-(y - height / 2 - pan[1]) / unit
	];
	const pointer = (event) => {
		const bounds = canvas.getBoundingClientRect();
		return [event.clientX - bounds.left, event.clientY - bounds.top];
	};
	function update() {
		const a = selected();
		const info = analyzeMatrix(a);
		root.querySelector(".inverse-editor").hidden = !editable();
		root.querySelector(".inverse-presets").hidden = !editable();
		root.querySelector(".inverse-output-vector").replaceChildren(
			...transform(a, selectedVector()).map((value) => {
				const cell = document.createElement("span");
				cell.textContent = formatNumber(value);
				return cell;
			})
		);
		root.querySelector(".inverse-buttons").hidden = !editable();
		root.querySelector(".inverse-help").hidden = true;
		inputs.forEach((input, i) => {
			if (document.activeElement !== input) input.value = String(values()[i]);
			input.disabled = playing || !active || !editable();
		});
		select.disabled = playing || !active || !editable();
		action("apply").disabled = playing || !active || !editable();
		action("inverse").disabled =
			playing ||
			!active ||
			!editable() ||
			!info.inverse ||
			phase === "original";
		action("reset").disabled = !active || !editable();
		root.classList.toggle("inverse-interactive", editable());
		canvas.style.pointerEvents = editable() ? "auto" : "none";
		root.querySelector(".inverse-determinant").hidden = introductory;
		root.querySelector(".inverse-determinant").textContent =
			"det(A) = " + info.determinantText + " · area scale = |det(A)|";
		const inverseBox = root.querySelector(".inverse-numerical");
		inverseBox.hidden = !info.inverse || (introductory && !inverseRevealed);
		root.querySelector(".inverse-values").replaceChildren(
			...(info.inverse || []).map((value) => {
				const cell = document.createElement("span");
				cell.textContent = formatNumber(value);
				return cell;
			})
		);
		// The area and information-loss scenes precede the inverse formula.
		if (
			scene === "area" ||
			scene === "loss" ||
			(scene === "intro" && !inverseRevealed)
		)
			inverseBox.hidden = true;
		root.querySelector(".inverse-vector-values").textContent =
			scene === "loss"
				? "u = (1, 0), w = (0, 2) → Au = " +
				  pair(transform(a, [1, 0])) +
				  ", Aw = " +
				  pair(transform(a, [0, 2]))
				: "v = " +
				  pair(selectedVector()) +
				  " → Av = " +
				  pair(transform(a, selectedVector()));
		status.textContent =
			validation ||
			(!info.inverse
				? info.exactZero
					? "This transformation cannot be undone."
					: "This transformation cannot be undone reliably here: its determinant is nonzero, but too close to singular at floating-point precision."
				: playing
				? phase === "undoing"
					? "Applying A⁻¹ to the transformed plane…"
					: "Applying A to the original plane…"
				: phase === "original"
				? "Back at the original plane: A⁻¹(Av) = v. A is still selected."
				: scene === "area"
				? "The outlined square has area 1. The shaded parallelogram has area |det(A)|."
				: "The transformed plane is shown.");
		root.querySelector(".inverse-why").hidden =
			!introductory || !!info.inverse || !editable();
		status.hidden =
			!editable() ||
			(!validation && !!info.inverse && !playing && phase !== "original");
		root.querySelector(".inverse-vector-values").hidden = scene !== "loss";
	}
	function line(points, color, thickness = 1, dash = []) {
		context.beginPath();
		points
			.map(screen)
			.forEach(([x, y], i) =>
				i ? context.lineTo(x, y) : context.moveTo(x, y)
			);
		context.strokeStyle = color;
		context.lineWidth = thickness;
		context.setLineDash(dash);
		context.stroke();
		context.setLineDash([]);
	}
	function polygon(points, fill, stroke, dash = []) {
		line([...points, points[0]], stroke, 1.5, dash);
		context.fillStyle = fill;
		context.fill();
	}
	function gridLine(points, color, thickness, section, transformed = false) {
		const geometry = transformed
			? points.map((point) => transform(shown, point))
			: points;
		const [start, end] = geometry.map(screen);
		if (Math.hypot(end[0] - start[0], end[1] - start[1]) < 0.01) return;
		const gradient = context.createLinearGradient(...start, ...end);
		// Match the original Grid shader's distance fade and minor-line opacity.
		const fadeDistance = transformed ? 100 : 50;
		const fadeStrength = transformed ? 8 : 5;
		for (let i = 0; i <= 64; i++) {
			const t = i / 64;
			const point = points[0].map(
				(value, axis) => value + t * (points[1][axis] - value)
			);
			const fade = Math.max(0, 1 - Math.hypot(...point) / fadeDistance);
			const opacity = (section ? 1 : 0.75) * fade ** fadeStrength;
			gradient.addColorStop(
				t,
				color +
					Math.round(opacity * 255)
						.toString(16)
						.padStart(2, "0")
			);
		}
		line(geometry, gradient, thickness);
	}
	function dot(point, color, radius, label, offset = [12, -12]) {
		const [x, y] = screen(point);
		context.beginPath();
		context.arc(x, y, radius, 0, Math.PI * 2);
		context.fillStyle = colorB3;
		context.fill();
		context.strokeStyle = color;
		context.lineWidth = 2;
		context.stroke();
		context.fillStyle = color;
		context.fillText(label, x + offset[0], y + offset[1]);
	}
	function arrow(point, color) {
		const [x, y] = screen(point);
		const [ox, oy] = screen([0, 0]);
		const length = Math.hypot(x - ox, y - oy);
		if (!length) return;
		// MathBox arrowhead: a 2.5:1 cone that shrinks with a cubic ease on short vectors.
		const lineWidth = vectorWidth * mathboxPixelScale;
		const size = vectorArrowSize * lineWidth * 1.25;
		const arrowSpace = 1.25;
		const mini = Math.min(1, Math.max(0, 1 - (length * arrowSpace) / size / 3));
		const range = size * (1 - mini ** 3);
		const half = range / 2.5;
		const ux = (x - ox) / length;
		const uy = (y - oy) / length;
		const bx = x - ux * range;
		const by = y - uy * range;
		context.beginPath();
		context.moveTo(ox, oy);
		context.lineTo(bx, by);
		context.strokeStyle = color;
		context.lineWidth = lineWidth;
		context.lineCap = "butt";
		context.stroke();
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(bx - uy * half, by + ux * half);
		context.lineTo(bx + uy * half, by - ux * half);
		context.closePath();
		context.fillStyle = color;
		context.fill();
	}
	function vectorLabel([x2, y2]) {
		const φ = Math.atan2(y2, x2);
		const [x, y] = screen([x2 + 0.6 * Math.cos(φ), y2 + 0.6 * Math.sin(φ)]);
		const tex = String.raw`\left[\begin{array}{r}
  ${formatCoord(x2)} \\
  ${formatCoord(y2)} \\
  
  \end{array}\right]`;
		if (
			!labels.some(
				(other) => other.tex === tex && Math.hypot(other.x - x, other.y - y) < 1
			)
		)
			labels.push({ x, y, tex });
	}
	function syncLabels() {
		const spans = [...labelLayer.children];
		labels.forEach(({ x, y, tex }, i) => {
			let span = spans[i];
			if (!span) {
				span = document.createElement("span");
				span.className = "text-2xl bg-base-300/50 inline-block";
				labelLayer.append(span);
			}
			if (span.dataset.tex !== tex) {
				span.dataset.tex = tex;
				span.innerHTML = katex.renderToString(tex);
			}
			span.style.transform =
				"translate(" + x + "px, " + y + "px) translate(-50%, -50%)";
		});
		spans.slice(labels.length).forEach((span) => span.remove());
	}
	function draw() {
		if (!active) return;
		context.clearRect(0, 0, width, height);
		context.font = '24px "Old Standard TT", serif';
		const extent =
			30 + Math.ceil(Math.max(Math.abs(pan[0]), Math.abs(pan[1])) / unit);
		// Bound work while panning; only decorative grid coverage changes.
		const limit = Math.min(extent, 120);
		for (let n = -limit; n <= limit; n++) {
			const coordinate = n * gridStyle.cellSize;
			const vertical = [
				[coordinate, -limit],
				[coordinate, limit]
			];
			const horizontal = [
				[-limit, coordinate],
				[limit, coordinate]
			];
			const section = coordinate % gridStyle.sectionSize === 0;
			const thickness = section
				? gridStyle.sectionThickness
				: gridStyle.cellThickness;
			gridLine(vertical, gridStyle.cellColor, thickness, section);
			gridLine(horizontal, gridStyle.cellColor, thickness, section);
			gridLine(
				vertical,
				section ? colorGrid : colorGridAlt,
				thickness,
				section,
				true
			);
			gridLine(
				horizontal,
				section ? colorGrid : colorGridAlt,
				thickness,
				section,
				true
			);
		}
		const square = [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1]
		];
		polygon(square, "#a8e9f20a", "#b0dce988", [4, 5]);
		polygon(
			square.map((p) => transform(shown, p)),
			cyan + "24",
			cyan + "99"
		);
		labels = [];
		arrow([shown[0], shown[2]], pink);
		arrow([shown[1], shown[3]], purple);
		if (!editable()) {
			vectorLabel([shown[0], shown[2]]);
			vectorLabel([shown[1], shown[3]]);
		}
		if (scene === "loss") {
			arrow(transform(shown, [1, 0]), "#ffd483");
			arrow(transform(shown, [0, 2]), cyan);
			vectorLabel(transform(shown, [1, 0]));
			vectorLabel(transform(shown, [0, 2]));
			// Concentric rings keep both outputs visible when they coincide.
			dot(transform(shown, [1, 0]), "#ffd483", 10, "");
		} else {
			const v = selectedVector();
			arrow(v, colorIn);
			arrow(transform(shown, v), cyan);
			vectorLabel(v);
			vectorLabel(transform(shown, v));
		}
		syncLabels();
		const [ox, oy] = screen([0, 0]);
		context.fillStyle = "#aeb2bd";
		context.fillText("0", ox - 16, oy + 18);
	}
	function resize() {
		const bounds = canvas.getBoundingClientRect();
		width = Math.max(1, bounds.width);
		height = Math.max(1, bounds.height);
		unit = pixelsPerUnit(height);
		const ratio = window.devicePixelRatio || 1;
		canvas.width = Math.round(width * ratio);
		canvas.height = Math.round(height * ratio);
		context.setTransform(ratio, 0, 0, ratio, 0, 0);
		draw();
	}
	function stop(settle = false) {
		cancelAnimationFrame(frame);
		if (settle && finishAnimation) finishAnimation();
		playing = false;
		finishAnimation = null;
	}
	function animate(inverse = false) {
		const targetMatrix = selected();
		if (
			!active ||
			!editable() ||
			(inverse &&
				(!analyzeMatrix(targetMatrix).inverse || phase === "original"))
		)
			return;
		stop();
		drag = null;
		validation = "";
		phase = inverse ? "undoing" : "applying";
		if (inverse) inverseRevealed = true;
		const from = inverse ? [...targetMatrix] : [...identity];
		const to = inverse ? [...identity] : [...targetMatrix];
		// Interpolating A → I is equivalent to interpolating I → A⁻¹ on
		// the already transformed geometry: ((1-t)I + tA⁻¹)A = (1-t)A + tI.
		// This avoids accumulating roundoff from repeated forward/inverse replays.
		finishAnimation = () => {
			shown = to;
			phase = inverse ? "original" : "transformed";
		};
		if (media.matches) {
			finishAnimation();
			finishAnimation = null;
			update();
			draw();
			return;
		}
		playing = true;
		shown = from;
		update();
		const start = performance.now();
		const tick = (now) => {
			const t = Math.min(1, (now - start) / 2000);
			const eased = t * t * (3 - 2 * t);
			shown = interpolate(from, to, eased);
			if (t === 1) {
				finishAnimation();
				finishAnimation = null;
				playing = false;
				update();
			} else frame = requestAnimationFrame(tick);
			draw();
		};
		frame = requestAnimationFrame(tick);
	}
	function edit(next) {
		if (playing || !active || !editable()) return;
		matrix = next;
		shown = [...matrix];
		inverseRevealed = false;
		phase = "transformed";
		validation = "";
		select.value =
			Object.keys(presets).find((name) =>
				presets[name].every((v, i) => v === matrix[i])
			) || "Custom";
		update();
		draw();
	}
	function setValue(i, value) {
		if (i < 4) {
			const next = [...matrix];
			next[i] = value;
			edit(next);
		} else if (!playing && active && editable()) {
			vector = [...vector];
			vector[i - 4] = value;
			validation = "";
			update();
			draw();
		}
	}
	inputs.forEach((input, i) => {
		// Same feel as the original NumberSpinner: drag horizontally to change the
		// value by 0.01 per pixel in 0.1 steps; a click without dragging types.
		let scrub = null;
		listen(input, "pointerdown", (event) => {
			if (
				event.button !== 0 ||
				input.disabled ||
				document.activeElement === input
			)
				return;
			event.preventDefault();
			input.setPointerCapture(event.pointerId);
			scrub = { x: event.clientX, value: values()[i], moved: false };
			document.documentElement.style.cursor = "ew-resize";
		});
		listen(input, "pointermove", (event) => {
			if (!scrub || event.clientX === scrub.x) return;
			scrub.value += (event.clientX - scrub.x) * 0.01;
			scrub.x = event.clientX;
			scrub.moved = true;
			setValue(i, Math.round(scrub.value * 10) / 10);
		});
		const endScrub = (event) => {
			if (!scrub) return;
			const clicked = event.type === "pointerup" && !scrub.moved;
			scrub = null;
			document.documentElement.style.cursor = "";
			if (clicked) {
				input.focus();
				input.select();
			}
		};
		listen(input, "pointerup", endScrub);
		listen(input, "pointercancel", endScrub);
		listen(input, "input", () => {
			const value = input.valueAsNumber;
			if (
				!Number.isFinite(value) ||
				Math.abs(value) > 1e150 ||
				(value !== 0 && Math.abs(value) < 1e-150)
			) {
				validation =
					"Enter a finite value with magnitude between 1e−150 and 1e150, or zero.";
				input.setAttribute("aria-invalid", "true");
				update();
				return;
			}
			input.removeAttribute("aria-invalid");
			setValue(i, value);
		});
		listen(input, "blur", () => {
			input.value = String(values()[i]);
			input.removeAttribute("aria-invalid");
			validation = "";
			update();
		});
	});
	listen(select, "change", () => edit([...presets[select.value]]));
	listen(action("apply"), "click", () => animate());
	listen(action("inverse"), "click", () => animate(true));
	listen(action("reset"), "click", () => {
		stop();
		pan = [0, 0];
		drag = null;
		vector = [...inputVector];
		edit([...defaultMatrix]);
	});
	listen(canvas, "contextmenu", (event) => event.preventDefault());
	listen(canvas, "pointerdown", (event) => {
		if (!active || !editable() || (event.button !== 0 && event.button !== 2))
			return;
		const position = pointer(event);
		if (event.button === 2)
			drag = { type: "pan", start: position, pan: [...pan] };
		else if (!playing && editable()) {
			const handles = [
				[shown[0], shown[2]],
				[shown[1], shown[3]]
			].map(screen);
			const nearby = handles
				.map((p, i) => ({
					i,
					distance: Math.hypot(p[0] - position[0], p[1] - position[1])
				}))
				.filter((p) => p.distance < 22);
			if (!nearby.length) return;
			const handle = nearby.length === 2 ? 1 - lastHandle : nearby[0].i;
			lastHandle = handle;
			drag = { type: "basis", handle };
		}
		if (drag) {
			event.preventDefault();
			canvas.setPointerCapture(event.pointerId);
		}
	});
	listen(canvas, "pointermove", (event) => {
		if (!drag) return;
		const position = pointer(event);
		if (drag.type === "pan") {
			pan = drag.pan.map((value, i) => value + position[i] - drag.start[i]);
			draw();
		} else {
			const point = world(position);
			const next = [...matrix];
			next[drag.handle] = point[0];
			next[drag.handle + 2] = point[1];
			edit(next);
		}
	});
	const release = (event) => {
		drag = null;
		if (canvas.hasPointerCapture(event.pointerId))
			canvas.releasePointerCapture(event.pointerId);
	};
	listen(canvas, "pointerup", release);
	listen(canvas, "pointercancel", release);
	listen(canvas, "lostpointercapture", () => {
		drag = null;
	});
	listen(media, "change", () => {
		if (media.matches) {
			stop(true);
			root.style.setProperty("--lesson-drift", "0px");
			update();
			draw();
		}
	});
	listen(window, "resize", resize);
	const observer = new ResizeObserver(resize);
	observer.observe(canvas);
	update();
	return {
		setActive(value, nextScene = scene) {
			if (active === value && scene === nextScene) return;
			stop(true);
			drag = null;
			active = value;
			scene = nextScene;
			root.hidden = !active;
			update();
			if (active) resize();
		},
		setInteraction(value) {
			value = value && active && (scene === "intro" || scene === "formula");
			if (interactive === value) return;
			stop(true);
			drag = null;
			if (interactive)
				playgroundSnapshot = {
					shown: [...shown],
					phase,
					pan: [...pan],
					inverseRevealed
				};
			interactive = value;
			if (interactive) {
				shown = playgroundSnapshot
					? [...playgroundSnapshot.shown]
					: [...matrix];
				phase = playgroundSnapshot?.phase || "transformed";
				pan = playgroundSnapshot ? [...playgroundSnapshot.pan] : [0, 0];
				inverseRevealed = playgroundSnapshot?.inverseRevealed || false;
			} else pan = [0, 0];
			update();
			draw();
		},
		setNarrative(nextMatrix, geometry, recovered = false) {
			if (interactive || !active) return;
			demoMatrix = nextMatrix;
			shown = geometry;
			phase = recovered ? "original" : "transformed";
			inverseRevealed = recovered;
			update();
			draw();
		},
		parallax(offset) {
			if (active && !drag)
				root.style.setProperty(
					"--lesson-drift",
					media.matches
						? "0px"
						: Math.max(-18, Math.min(18, offset * 0.035)) + "px"
				);
		},
		destroy() {
			stop();
			observer.disconnect();
			listeners.forEach((remove) => remove());
			root.replaceChildren();
		}
	};
}
