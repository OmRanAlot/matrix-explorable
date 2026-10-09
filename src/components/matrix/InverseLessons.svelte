<!-- cloned from repo https://github.com/yizhe-ang/matrix-explorable — original visualization by Yi Zhe Ang. -->
<script>
	import { onMount, tick } from "svelte";
	import { loaded } from "$stores";
	import { lessonOwner, lessonBlend } from "$stores/lessonOwner.js";
	import { createInversePlayground } from "$utils/inversePlayground.js";
	import {
		defaultMatrix,
		identity,
		interpolate,
		presets
	} from "$utils/inverseMath.js";
	import { gsap, ScrollTrigger } from "$utils/gsap.js";
	import "../../styles/inverseLessons.css";

	let introRoot;
	let formulaRoot;
	onMount(() => {
		const intro = createInversePlayground(introRoot, { introductory: true });
		const formula = createInversePlayground(formulaRoot);
		const ids = [
			"inverse-lesson",
			"determinant-lesson",
			"information-loss",
			"inverse-formula",
			"section-2"
		];
		const sections = ids.map((id) => document.getElementById(id));
		const introTry = document.getElementById("inverse-try");
		const formulaTry = document.getElementById("inverse-formula-try");
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const progress = {
			forward: 0,
			undo: 0,
			area: 0,
			line: 0,
			point: 0,
			recover: 0
		};
		let frame = 0;
		let context;
		let initialized = false;
		let destroyed = false;
		let previousOwner = null;
		let handoff;
		let ownership = [];
		let interactions = {};
		let steps = {};
		let textTriggers = [];
		const progressAt = (key) =>
			media.matches ? (steps[key]?.progress > 0 ? 1 : 0) : progress[key];

		function update() {
			frame = 0;
			let index = -1;
			const center = window.innerHeight / 2;
			if (window.innerWidth >= 1024) {
				if (ownership.length)
					ownership.forEach((range, i) => {
						if (window.scrollY >= range.start) index = i;
					});
				else
					sections.forEach((section, i) => {
						if (section.getBoundingClientRect().top <= center) index = i;
					});
			}
			const owner = ["intro", "area", "loss", "formula"][index] || null;
			if (owner !== previousOwner) {
				// Use the original GSAP timing for the handoff between native and 3D layers.
				handoff?.kill();
				if (owner && !previousOwner) {
					lessonBlend.set(0);
					const blend = { value: 0 };
					handoff = gsap.to(blend, {
						value: 1,
						duration: media.matches ? 0 : 0.3,
						onUpdate: () => lessonBlend.set(blend.value)
					});
				} else lessonBlend.set(owner ? 1 : 0);
				previousOwner = owner;
			}
			lessonOwner.set(owner);
			intro.setActive(owner === "intro");
			formula.setActive(
				owner !== null && owner !== "intro",
				owner === "intro" || owner === null ? undefined : owner
			);
			intro.setInteraction(
				owner === "intro" &&
					interactions.intro &&
					window.scrollY >= interactions.intro.start
			);
			formula.setInteraction(
				owner === "formula" &&
					interactions.formula &&
					window.scrollY >= interactions.formula.start
			);
			if (owner === "intro") {
				const geometry =
					progressAt("undo") > 0
						? interpolate(defaultMatrix, identity, progressAt("undo"))
						: interpolate(identity, defaultMatrix, progressAt("forward"));
				intro.setNarrative(defaultMatrix, geometry, progressAt("undo") === 1);
			} else if (owner === "area") {
				formula.setNarrative(
					defaultMatrix,
					interpolate(identity, defaultMatrix, progressAt("area"))
				);
			} else if (owner === "loss") {
				const point = steps.point && window.scrollY >= steps.point.start;
				formula.setNarrative(
					point ? presets["Point collapse"] : presets["Line collapse"],
					point
						? interpolate(
								presets["Line collapse"],
								presets["Point collapse"],
								progressAt("point")
						  )
						: interpolate(
								defaultMatrix,
								presets["Line collapse"],
								progressAt("line")
						  )
				);
			} else if (owner === "formula") {
				formula.setNarrative(
					defaultMatrix,
					interpolate(
						presets["Point collapse"],
						defaultMatrix,
						progressAt("recover")
					)
				);
			}
			if (owner) {
				const offset = sections[index].getBoundingClientRect().top;
				intro.parallax(offset);
				formula.parallax(offset);
			}
		}
		function schedule() {
			if (!frame && !destroyed) frame = requestAnimationFrame(update);
		}
		function fadeStProgress(opacity) {
			gsap.to("#st-progress", { opacity, duration: 0.5 });
		}
		function initialize() {
			if (destroyed || initialized) return;
			initialized = true;
			// These use the same pinned article, easing, progress bar and scroll distance
			// as the existing st-1 … st-13 lessons. Interaction windows are never pinned.
			context = gsap.context(() => {
				for (const [key, id] of Object.entries({
					forward: "inverse-forward",
					undo: "inverse-undo",
					area: "area-scale",
					line: "loss-line",
					point: "loss-point",
					recover: "formula-recover"
				})) {
					const state = { value: 0 };
					const tween = gsap.to(state, {
						value: 1,
						ease: "none",
						duration: 1,
						onUpdate: function () {
							progress[key] = state.value;
							gsap.set("#st-progress", { scaleY: this.progress() });
							schedule();
						},
						scrollTrigger: {
							trigger: "#" + id,
							fastScrollEnd: true,
							pin: "#article",
							pinnedContainer: "#article",
							start: "center center",
							end: "+=1000",
							scrub: 1,
							pinSpacing: true,
							toggleClass: "active",
							invalidateOnRefresh: true,
							onEnter: () => fadeStProgress(1),
							onLeave: () => fadeStProgress(0),
							onEnterBack: () => fadeStProgress(1),
							onLeaveBack: () => fadeStProgress(0)
						}
					});
					steps[key] = tween.scrollTrigger;
				}
				if (!media.matches)
					gsap.utils
						.toArray("#article section.inverse-section > *")
						.forEach((el) => {
							const animation =
								el.className === "exclude"
									? gsap
											.timeline({ paused: true })
											.from(el, { opacity: 0, y: 100, duration: 0.6 })
											.from(el.querySelectorAll("li"), {
												x: -40,
												opacity: 0,
												stagger: { amount: 0.3 }
											})
									: gsap.from(el, { opacity: 0, y: 20, paused: true });
							ScrollTrigger.create({
								trigger: el,
								start: "top center",
								animation,
								pinnedContainer: "#article"
							});
						});
				ownership = ids.map((id) =>
					ScrollTrigger.create({
						trigger: "#" + id,
						start: "top center",
						end: "+=1",
						pinnedContainer: "#article",
						onToggle: schedule
					})
				);
				interactions = Object.fromEntries(
					[
						["intro", introTry],
						["formula", formulaTry]
					].map(([key, trigger]) => [
						key,
						ScrollTrigger.create({
							trigger,
							start: "top center",
							end: "+=1",
							pinnedContainer: "#article",
							onToggle: schedule
						})
					])
				);
			});
			textTriggers = ScrollTrigger.getAll().filter(
				(trigger) =>
					trigger.animation &&
					!trigger.pin &&
					trigger.trigger?.closest("section.inverse-section")
			);
			// The st-9 … st-13 pins were measured before these lessons existed, so one
			// sort by their stale starts can misplace them; repeat until stable.
			// Triggers on #article itself depend on every pin's spacing, so they must
			// stay last regardless of their measured start.
			const article = document.getElementById("article");
			const pageOrder = (a, b) =>
				(a.trigger === article) - (b.trigger === article) || a.start - b.start;
			for (let i = 0; i < 10; i++) {
				const order = ScrollTrigger.getAll();
				ScrollTrigger.sort(pageOrder);
				if (i && ScrollTrigger.getAll().every((t, j) => t === order[j])) break;
				ScrollTrigger.refresh();
			}
			// Web fonts and KaTeX swap in after this first measurement and reflow the
			// text, so re-measure whenever the article's sections change height.
			document.fonts.ready.then(remeasure);
			document
				.querySelectorAll("#article section")
				.forEach((section) => sizeObserver.observe(section));
			schedule();
		}
		let remeasureTimer;
		function remeasure() {
			clearTimeout(remeasureTimer);
			remeasureTimer = setTimeout(() => {
				if (!destroyed) ScrollTrigger.refresh();
			}, 150);
		}
		const heights = new WeakMap();
		const sizeObserver = new ResizeObserver((entries) => {
			let changed = false;
			for (const { target, contentRect } of entries) {
				if (heights.has(target) && heights.get(target) !== contentRect.height)
					changed = true;
				heights.set(target, contentRect.height);
			}
			if (changed) remeasure();
		});
		const unsubscribe = loaded.subscribe((ready) => {
			if (ready) tick().then(initialize);
		});
		function motionChanged() {
			if (media.matches) {
				handoff?.progress(1);
				handoff?.kill();
				textTriggers.forEach((trigger) => {
					trigger.animation?.progress(1);
					trigger.disable(false);
				});
			} else textTriggers.forEach((trigger) => trigger.enable());
			schedule();
		}
		media.addEventListener("change", motionChanged);
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		ScrollTrigger.addEventListener("refresh", schedule);
		update();
		return () => {
			destroyed = true;
			unsubscribe();
			cancelAnimationFrame(frame);
			clearTimeout(remeasureTimer);
			sizeObserver.disconnect();
			handoff?.kill();
			context?.revert();
			media.removeEventListener("change", motionChanged);
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			ScrollTrigger.removeEventListener("refresh", schedule);
			intro.destroy();
			formula.destroy();
			lessonOwner.set(null);
			lessonBlend.set(0);
		};
	});
</script>

<div
	class="inverse-host"
	class:inverse-active={$lessonOwner !== null}
	style:opacity={$lessonBlend}
>
	<div class="inverse-playground" bind:this={introRoot} hidden />
	<div class="inverse-playground" bind:this={formulaRoot} hidden />
</div>
