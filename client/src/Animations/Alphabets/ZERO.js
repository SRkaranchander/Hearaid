export const ZERO = (ref) => {
    let animations = []

    // 0: All fingers curled into an O shape
    // Index finger curled
    animations.push(["mixamorigRightHandIndex1", "rotation", "z", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightHandIndex2", "rotation", "z", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightHandIndex3", "rotation", "z", Math.PI / 1.5, "+"]);

    // Middle finger curled
    animations.push(["mixamorigRightHandMiddle1", "rotation", "z", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightHandMiddle2", "rotation", "z", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightHandMiddle3", "rotation", "z", Math.PI / 1.5, "+"]);

    // Ring finger curled
    animations.push(["mixamorigRightHandRing1", "rotation", "z", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightHandRing2", "rotation", "z", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightHandRing3", "rotation", "z", Math.PI / 1.5, "+"]);

    // Pinky finger curled
    animations.push(["mixamorigRightHandPinky1", "rotation", "z", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightHandPinky2", "rotation", "z", Math.PI / 1.5, "+"]);
    animations.push(["mixamorigRightHandPinky3", "rotation", "z", Math.PI / 1.5, "+"]);

    // Thumb closed to touch the curled fingers (creating the O shape)
    animations.push(["mixamorigRightHandThumb1", "rotation", "x", Math.PI / 3, "+"]);
    animations.push(["mixamorigRightHandThumb1", "rotation", "y", Math.PI / 3, "+"]);
    animations.push(["mixamorigRightHandThumb2", "rotation", "y", -Math.PI / 6, "-"]);
    animations.push(["mixamorigRightHandThumb3", "rotation", "y", -Math.PI / 7, "-"]);

    // Palm facing front (using V.js alignment for upright visible hand)
    animations.push(["mixamorigRightHand", "rotation", "z", -Math.PI / 2.3, "-"]);
    animations.push(["mixamorigRightHand", "rotation", "y", -Math.PI / 5, "-"]);

    animations.push(["mixamorigRightForeArm", "rotation", "z", Math.PI / 2.65, "+"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", Math.PI / 30, "+"]);

    animations.push(["mixamorigRightArm", "rotation", "x", -Math.PI / 4, "-"]);

    ref.animations.push(animations);

    animations = []

    // Reset all rotations
    animations.push(["mixamorigRightHandIndex1", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandIndex2", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandIndex3", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandMiddle1", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandMiddle2", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandMiddle3", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandRing1", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandRing2", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandRing3", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandPinky1", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandPinky2", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightHandPinky3", "rotation", "z", 0, "-"]);

    animations.push(["mixamorigRightHandThumb1", "rotation", "x", 0, "-"]);
    animations.push(["mixamorigRightHandThumb1", "rotation", "y", 0, "-"]);
    animations.push(["mixamorigRightHandThumb2", "rotation", "y", 0, "+"]);
    animations.push(["mixamorigRightHandThumb3", "rotation", "y", 0, "+"]);

    animations.push(["mixamorigRightHand", "rotation", "z", 0, "+"]);
    animations.push(["mixamorigRightHand", "rotation", "y", 0, "+"]);

    animations.push(["mixamorigRightForeArm", "rotation", "z", 0, "-"]);
    animations.push(["mixamorigRightForeArm", "rotation", "x", 0, "-"]);

    animations.push(["mixamorigRightArm", "rotation", "x", 0, "+"]);

    ref.animations.push(animations);

    if (ref.pending === false) {
        ref.pending = true;
        ref.animate();
    }
}
