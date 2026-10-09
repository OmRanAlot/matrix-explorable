<script>
	import Tex from "./Tex.svelte";
	import {
		matrixVectorFormulaColored,
		vectorAsLinearComb,
		matrixVectorFormulaEg,
		matrixVectorFormula3dEg
	} from "$data/tex";
	import Term from "./Term.svelte";
	import ColorText from "./ColorText.svelte";
	import Insight from "./Insight.svelte";
	import Intro from "./Intro.svelte";
	import P from "./P.svelte";
	import Spacer from "./Spacer.svelte";
	import Action from "./Action.svelte";
	import Section from "./Section.svelte";
	import B from "./B.svelte";
	import { Grab } from "lucide-svelte";
	import ActionIcon from "./ActionIcon.svelte";
	import InteractionsList from "./InteractionsList.svelte";
	import { gsap, ScrollTrigger } from "$utils/gsap.js";
	import { onMount } from "svelte";
	import { arcadeMounted } from "$stores";

	// let mounted;

	// $: if (mounted && $arcadeMounted) animate();

	// onMount(() => {
	// 	mounted = true;
	// });

	// function animate() {
	// 	gsap.utils.toArray("#article section.animate > *").forEach((el) => {
	// 		let animation;

	// 		if (el.className === "exclude") {
  //       animation = gsap.timeline({ paused: true })
  //         .from(el, {
  //           opacity: 0,
  //           y: 100,
  //           duration: 0.6
  //         })
  //         .from(el.querySelectorAll('li'), {
  //           x: -40,
  //           opacity: 0,
  //           stagger: {
  //             amount: 0.3
  //           }
  //         })
	// 		} else {
	// 			animation = gsap.from(el, {
	// 				opacity: 0,
	// 				y: 20,
	// 				paused: true
	// 			});
	// 		}

	// 		ScrollTrigger.create({
	// 			trigger: el,
	// 			start: "top center",
	// 			animation,
	// 			pinnedContainer: "#article"
	// 		});
	// 	});
	// }
</script>

<div
	id="article"
	class="relative max-w-prose bg-gradient-to-l from-base-100 via-base-300 via-90% py-12"
>
	<div id="title-spacer" class="h-[2500px]" />

	<Intro />

	<div class="h-[500px]" />

	<!-- <section id="section-1" class="prose prose-xl [&>*]:px-10 [&>*]:rounded-xl"> -->
	<Section id="section-1" classNames="animate">
		<!-- <section class="prose prose-xl max-w-[50ch]"> -->
		<!-- <h2>Matrix as Linear Transformations</h2> -->

		<p>
			A vector multiplied by a matrix returns yet another vector — it <B
				>transforms</B
			> a vector into a new vector. Let's visualize this transformation with an example.
		</p>

		<!-- <h3>Vectors as a Linear Combination of Basis Vectors</h3> -->

		<Spacer />

		<P id="st-1">
			Let's first think about what the coordinates of a <ColorText color="in"
				>vector</ColorText
			> represent.
		</P>

		<!-- TODO: Animate the text decoration, syncing it with the rest of the animations -->
		<!-- TODO: On hover, highlights all the matching elements -->
		<P id="st-2">
			In the <Tex expr={"xy"} />-coordinate plane, any vector can be thought of
			as the sum of two scaled vectors: the unit vector in the
			<nobr><ColorText color="p"><Tex expr="x" />-direction</ColorText></nobr>,
			and the unit vector in the <ColorText color="s"
				><Tex expr="y" />-direction</ColorText
			>.
		</P>

		<!-- <P id="st-3">
			<Tex expr={vectorAsLinearComb} display color />
      The unit-vector in the x-direction is scaled by the x-coordinate of the vector, and the unit-vector in the y-direction is scaled by the y-coordinate of the vector.
    </P> -->

		<!-- <Tex
      expr={vectorAsLinearCombAlt}
      display
    /> -->

		<!-- TODO: Do text highlighting that syncs with the corresponding animation -->
		<P id="st-3">
			<Tex expr={vectorAsLinearComb} display color />
			These are also known as our <Term>standard basis vectors</Term>. The
			vector's coordinates encode the amount to scale each individual basis
			vector, before adding them up.
		</P>

		<p>
			This scaling and addition of vectors is called a <Term
				>linear combination</Term
			>, and every vector can be expressed as a linear combination of basis
			vectors.
		</p>

		<Spacer />

		<Tex expr={matrixVectorFormulaColored} display />

		<p>
			Did you notice anything similar with the expression for matrix-vector
			multiplication? A vector multiplied with a matrix can also be expressed as
			a linear combination; only this time the standard basis vectors are
			replaced by the columns of the matrix.
		</p>

		<Tex expr={matrixVectorFormulaEg} display color />

		<P id="st-4">
			In other words, a matrix can be viewed as a way of packaging information
			about the new basis vectors that we want. This is the core insight: a
			matrix transforms a vector by <B
				>transforming the original basis vectors</B
			>; creating an entirely new coordinate system.
		</P>

		<P id="st-5">
			Again, the transformed vector is a linear combination of the new basis
			vectors, which are scaled by the coordinates of the original vector.
		</P>

		<Spacer />

		<p>
			In that vein, a matrix transformation appears to warp and transform space.
			To get a visceral feel of this, let's visualize what happens to not just a
			single vector, but <B>a sample of vectors in space</B>, each multiplied by
			the same matrix.
		</p>

		<P id="st-6">
			In order to make the space less visually cluttered, we can represent each
			vector with just its tip as a point in space. We'll transform the grid
			lines along too, overlaying on top a copy of the original.
		</P>

		<P id="st-7">
			The transformation appears to rotate and stretch the space, accordingly
			with where the new basis vectors land.
		</P>

		<P>
			As we'll see when you have a chance to tinker around with different basis
			vectors, a matrix performs a particular kind of transformation, called a <Term
				>linear transformation</Term
			>. Visually, you'll notice that:
		</P>

		<ul class="ml-4 marker:text-info marker:text-2xl">
			<li>
				All lines in the original space remain as lines, without getting curved,
				and
			</li>
			<li>Origin remains fixed in place.</li>
		</ul>

		<p>
			As an example, all grid lines stay parallel and evenly spaced after the
			transformation.
		</p>

		<Spacer />

		<!-- TODO: Have a kind of recap at the end -->
		<div class="exclude">
			<Tex expr={matrixVectorFormulaColored} display />
			<Insight>
				<ul>
					<li>
						Any vector can be expressed as the addition of scaled basis vectors,
						i.e.
						<B>a linear combination of basis vectors</B>.
					</li>
					<li>
						A matrix can be viewed as a way to <B
							>package information about a linear transformation</B
						>. The columns of a matrix represent where the new basis vectors
						land after the transformation.
					</li>
					<li>
						Matrix-vector multiplication is a way to compute where a given
						vector lands after the transformation defined by a matrix.
					</li>
				</ul>
			</Insight>
		</div>

		<Spacer />

		<div class="exclude">
			<P id="st-8">
				With our understanding so far, try to tinker about and figure out what
				kinds of transformations are possible with matrices!
			</P>
			<p>
				What basis vectors should you choose in order to scale space uniformly
				in all directions? How about a reflection, rotation or a shear?
			</p>
			<Action>
				<!-- TODO: Allow users to grab the basis vectors too? -->
				<ul class="list-none">
					<InteractionsList />
				</ul>
			</Action>
		</div>
	</Section>

	<Section id="inverse-lesson" classNames="animate inverse-section">
		<h2 class="text-neutral">Undoing a Transformation</h2>
		<P id="inverse-forward">
			Multiplication by a number can often be undone by division. For a matrix,
			the corresponding idea is multiplication by its <Term>inverse</Term>,
			written <Tex expr={"A^{-1}"} />.
		</P>
		<P id="inverse-undo">
			Think of the inverse as another transformation: it moves <B
				>every transformed vector back to where it started</B
			>. In the plane beside you, our vector
			<Tex expr={"v=(-1,2)"} /> lands at <Tex expr={"Av=(0,2)"} />. As you
			scroll, the inverse brings it home, along with the entire grid.
		</P>
		<Tex expr={"A^{-1}(Av)=v"} display />
		<p>
			The pale grid remembers the original plane. The pink and purple arrows
			mark where the two basis vectors land. Watch the inverse return both basis
			vectors to their standard directions. Every point in the transformed plane
			follows the same journey back.
		</p>
		<Spacer />
		<p>
			There is a catch. To undo a transformation, each output must identify
			<B>exactly one input</B>. If two different vectors land at the same place,
			which one should the inverse choose?
		</p>
		<p>
			Some matrices collapse the plane onto a line or a point. These
			transformations lose information, so they have no inverse. To see why,
			let's first look at area.
		</p>
		<Spacer />
		<div class="exclude">
			<P id="inverse-try"
				>Now try undoing a transformation yourself. The controls are available
				while you explore this part of the lesson.</P
			>
			<Action>
				<ul class="list-none">
					<li>
						<B>Left click and drag</B> a basis endpoint, or edit the matrix entries.
					</li>
					<li>
						<B>Drag</B> the numbers to increase or decrease the values in the matrix
						or input vector
					</li>
					<li><B>Right click and drag</B> to pan the plane.</li>
					<li>
						Choose <B>Animate Inverse</B> to undo A, and <B
							>Apply Transformation</B
						> to replay it.
					</li>
					<li>
						Try a collapse preset. <B>Reset</B> restores the example and cancels
						playback.
					</li>
				</ul>
			</Action>
		</div>
	</Section>

	<Section id="determinant-lesson" classNames="animate inverse-section">
		<h2 class="text-neutral">The Determinant Measures Area</h2>
		<P id="area-scale">
			The two standard basis vectors enclose a square of area one. After a
			transformation, their new positions enclose a <Term>parallelogram</Term>.
			The shaded region beside you shows exactly where that square went.
		</P>
		<Tex
			expr={"A=\\begin{bmatrix}a&b\\\\c&d\\end{bmatrix},\\qquad \\det(A)=ad-bc"}
			display
		/>
		<p>
			This number, the <Term>determinant</Term>, is the <B>signed area scale</B>
			of the transformation. The parallelogram's area is
			<Tex expr={"|\\det(A)|"} />. Our example has determinant
			<Tex expr={"2\\cdot1-1\\cdot0=2"} />: the unit square becomes a
			parallelogram of area two, and every other region doubles in area too.
		</p>
		<Spacer />
		<p>
			A negative determinant does not mean negative area. It means the
			transformation <B>reverses orientation</B>, like a reflection in a mirror.
			A determinant of <Tex expr={"-1"} /> preserves area while flipping the order
			of the basis directions.
		</p>
		<p>
			But what happens when the two transformed basis vectors point along the
			same line? The parallelogram becomes flat. Its area, and the determinant,
			are zero.
		</p>
	</Section>

	<Section id="information-loss" classNames="animate inverse-section">
		<h2 class="text-neutral">When Space Loses Information</h2>
		<P id="loss-line">
			Here the <ColorText color="p">pink basis vector is (2, 2)</ColorText> and the
			<ColorText color="s">purple basis vector is (1, 1)</ColorText>. Purple
			multiplied by two equals pink. These vectors are
			<Term>linearly dependent</Term>: one adds no new direction beyond the
			other.
		</P>
		<Tex
			expr={"\\det\\begin{bmatrix}2&1\\\\2&1\\end{bmatrix}=2\\cdot1-1\\cdot2=0"}
			display
		/>
		<p>
			Watch the two distinct inputs <Tex expr={"u=(1,0)"} /> and
			<Tex expr={"w=(0,2)"} /> merge at <Tex expr={"(2,2)"} />. The gold and
			cyan rings now mark the same output. Scroll back to follow their paths
			again.
		</p>
		<p>
			Every output on that line has infinitely many possible inputs. No inverse
			can tell which one we started with. The transformation has erased a whole
			direction of information.
		</p>
		<Spacer />
		<P id="loss-point">
			Keep scrolling for the extreme case, a <B>collapse to a point</B>: a
			matrix of zeros sends every vector to the origin. Both basis vectors
			disappear into the same point, and all area is lost.
		</P>
		<Insight>
			A two-dimensional matrix is invertible exactly when its determinant is
			nonzero. A zero determinant means the plane collapses to a line or a
			point.
		</Insight>
	</Section>

	<Section id="inverse-formula" classNames="animate inverse-section">
		<h2 class="text-neutral">Calculating the Way Back</h2>
		<P id="formula-recover">
			Now we can give the inverse a formula. Swap the diagonal entries, change
			the signs of the other two, and divide by the determinant:
		</P>
		<Tex
			expr={"A^{-1}=\\frac{1}{ad-bc}\\begin{bmatrix}d&-b\\\\-c&a\\end{bmatrix}"}
			display
		/>
		<p>
			The division by <Tex expr={"ad-bc"} /> explains why a zero determinant stops
			us. Division by zero is undefined, reflecting the geometric problem: there
			is <B>no unique original input to recover</B>.
		</p>
		<p>
			For our example, the inverse is
			<Tex expr={"\\begin{bmatrix}0.5&-0.5\\\\0&1\\end{bmatrix}"} />. It halves
			the area back to its original size while undoing the shear.
		</p>
		<Spacer />
		<P id="inverse-formula-try"
			>Go ahead and find the inverse yourself. The controls open here for a
			fresh playground.</P
		>
		<Action>
			<ul class="list-none">
				<li>Edit A or drag its basis endpoints.</li>
				<li>
					<B>Drag</B> the numbers to increase or decrease the values in the matrix
					or input vector
				</li>
				<li>
					Compare the determinant and inverse while replaying the forward and
					inverse transformations.
				</li>
			</ul>
		</Action>
		<p>
			This is a fresh playground. Change A and watch its determinant and
			numerical inverse update together. Try the identity, shear, and reflection
			presets, then compare them with the two collapses.
		</p>
		<p>
			After <B>Animate Inverse</B>, the plane returns to its original shape. The
			selected matrix and its inverse stay visible so you can compare them.
			<B>Reset</B> cancels playback and restores the starting example and camera.
		</p>
		<p>
			Very close to a collapse, tiny changes can produce enormous changes in the
			inverse. This playground pauses inversion when floating-point precision
			cannot reliably distinguish the matrix from a singular one. That is a
			numerical limit; a nonzero determinant is still mathematically invertible.
		</p>
		<p class="text-sm">
			Original visualization by <a
				href="https://github.com/yizhe-ang/matrix-explorable">Yi Zhe Ang</a
			>. These inverse and determinant lessons extend that work.
		</p>
	</Section>

	<!-- TODO: How about 3D? -->
	<Section id="section-2" classNames="animate">
		<h2 class="text-neutral">Beyond Two-Dimensions</h2>

		<p>
			So far we've only been talking about matrix transformations in
			two-dimensions on the <Tex expr="xy" />-plane. Do the same intuitions
			carry over to <B>higher dimensions</B>?
		</p>

		<P id="st-9">
			To make up three dimensions, we have yet another standard basis vector —
			the unit vector in the <ColorText color="a"
				><Tex expr="z" />-direction</ColorText
			>. This also means we're now fiddling around with vectors of length <Tex
				expr="3"
			/> — representing the <Tex expr="xyz" /> coordinates — and matrices of size
			<nobr><Tex expr="3\times3" /></nobr>.
		</P>

		<P id="st-10">
			The concept of matrix transformations in 3D is exactly the same. The three
			basis vectors are transformed to their new locations, warping space along
			with them. These locations are completely determined by the columns of the
			matrix.
		</P>

		<Tex expr={matrixVectorFormula3dEg} display color />

		<P id="st-11">
			Originally, any vector is composed of a linear combination of these three
			standard basis vectors. To figure out the where the vector lands after the
			transformation, it is a linear combination of the transformed basis
			vectors, each scaled by the respective coordinates in the starting vector.
		</P>

		<P id="st-12">
			From these visually-focused examples we've seen thus far, the most obvious application
			of matrix transformations would be that of computer graphics. In fact,
			this is precisely how this article was built! Matrices provide a language
			to rotate, scale and translate vectors and points and consequently entire
			objects in 2D or 3D space.
		</P>

		<!-- <p>
			Talk about application in computer graphics... give a concrete example
			visually. Give other examples of applications of matrices... From the
			visual examples we've seen thus far, the most obvious application of
			matrix transformations would be that of computer. In fact,
		</p> -->
		<Spacer />
		<div class="exclude">
			<p id="st-13">
				Go forth and wrap your head around matrix transformations in 3D! Now you
				have a whole additional dimension to fidget around with.
			</p>
			<Action>
				<ul class="list-none">
					<InteractionsList />
					<li>
						<ActionIcon icon={Grab} />
						<B>Right click and drag</B> to rotate around the space
					</li>
				</ul>
			</Action>
		</div>
	</Section>

	<!-- TODO: Composition of matrices -->
</div>
