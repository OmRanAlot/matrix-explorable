// cloned from repo https://github.com/yizhe-ang/matrix-explorable — original visualization by Yi Zhe Ang.
import { writable } from "svelte/store";

// null delegates ownership to the original 2D/3D ScrollTrigger narrative.
export const lessonOwner = writable(null);
export const lessonBlend = writable(0);
