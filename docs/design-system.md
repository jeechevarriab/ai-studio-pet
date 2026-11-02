# Simulator visual and motion system

Audience: the owner developing and reviewing a personal studio companion before hardware arrives. The device should communicate presence, mood and activity at a glance; surrounding controls should make experimentation easy.

The 410 × 502 black display is the primary focal point. A small status header leads to one centered character, a short caption and four mode labels. Development controls sit outside the device. The pale neutral development surface separates controls from the AMOLED experience. Type uses system sans and monospace fonts without remote font requests or branding from other projects.

Character: one original rounded geometric body, expressive 5 × 7 dot eyes, restrained gradient, light halftone and a soft grounding shadow. Four colors distinguish Idle, Happy, Focused and Sleeping. Scene props remain subordinate: work laptop, surf lines, rainy perimeter and sleep crescent/stars.

Motion: sinusoidal float/breath cycles, occasional blinks and 330 ms horizontal cubic ease-out mode transitions. Sleep is slower and smaller; Happy is quicker and buoyant. Controls provide pause and 0.5×/1×/2× speed. Reduced-motion preference disables looping movement and slide transitions. Background elapsed jumps are clamped. Captions remain still and readable.

Expression definitions are editable in character/expressions.json. The small tuning panel changes current expression color/float distance and shared eye-dot size, then exports JSON. It does not implement a full animation timeline editor or the other twelve expressions. Preserve the original brief for later milestones.
