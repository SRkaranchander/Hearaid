import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ClickSpark from "../Components/animations/ClickSpark";

const ALPHA_DATA = {
  A: { name: 'Letter A', instructions: ['Make a fist with your right hand', 'Keep your thumb resting on the side of your index finger', 'Extend your thumb upward along the side of your fist', 'Hold your hand up with your thumb pointing upward'], tip: 'Think of the "A" sign as making a fist with your thumb resting on the side, like holding a small object.' },
  B: { name: 'Letter B', instructions: ['Hold your hand up with your palm facing forward', 'Keep your fingers straight and close together', 'Point your fingers upward', 'Tuck your thumb across your palm'], tip: 'The "B" sign looks like a "4" but with fingers close together. Your thumb crosses over your palm.' },
  C: { name: 'Letter C', instructions: ['Curve your hand into the shape of the letter C', 'Keep your palm facing sideways toward you', 'Your thumb and fingers should form a curved shape', 'Move your hand in a small circle to show the curve'], tip: 'Think of holding a cup or tube. The "C" shows the curve of the letter.' },
  D: { name: 'Letter D', instructions: ['Make a fist with your right hand', 'Point your index finger upward', 'Keep your other fingers curled in', 'Your thumb curls over your middle and ring fingers'], tip: 'The "D" looks like a finger pointing up while making a fist.' },
  E: { name: 'Letter E', instructions: ['Curve your fingers like you\'re grabbing something', 'Keep your palm facing forward', 'Bend all four fingers down toward your palm', 'Tuck your thumb in over your fingers'], tip: 'The "E" looks like you\'re grabbing with all four fingers. Your hand looks like a claw.' },
  F: { name: 'Letter F', instructions: ['Hold up your index finger and thumb', 'Touch the tips of your index finger and thumb together', 'Keep your other three fingers straight up', 'Hold your palm facing forward'], tip: 'The "F" — index and thumb make an "o" shape while other fingers point up.' },
  G: { name: 'Letter G', instructions: ['Point your index finger to the side', 'Keep your other fingers curled into your palm', 'Extend your thumb and hold it against your middle finger', 'Turn your hand sideways'], tip: 'The "G" is made sideways. Think of pointing to the letter G on a sign.' },
  H: { name: 'Letter H', instructions: ['Hold your hand sideways', 'Extend your index and middle fingers pointing to the side', 'Keep your other fingers curled', 'Your thumb rests on your ring finger'], tip: 'The "H" is also made sideways. Two fingers side by side represent the two lines in H.' },
  I: { name: 'Letter I', instructions: ['Make a fist with all fingers curled in', 'Extend only your pinky finger upward', 'Keep your palm facing forward', 'Your thumb rests across your fingers'], tip: 'The "I" is simple — just stick up your pinky! Like the letter I has one stroke.' },
  J: { name: 'Letter J', instructions: ['Start with the "I" sign (pinky up)', 'Draw a small "J" shape in the air with your pinky', 'Move your hand down and curve it', 'Finish with your pinky pointing down and inward'], tip: 'The "J" is like "I" but you trace the letter J in the air with your pinky finger.' },
  K: { name: 'Letter K', instructions: ['Hold up your index and middle fingers in a V shape', 'Point them upward like a peace sign', 'Place your thumb between and above your index and middle fingers', 'Keep your other fingers curled'], tip: 'The "K" looks like the letter K — two fingers up with a thumb between them.' },
  L: { name: 'Letter L', instructions: ['Extend your index finger upward', 'Extend your thumb to the side', 'Keep your other fingers curled into your palm', 'Your hand forms an L shape'], tip: 'The "L" is easy — just make an L with your index finger and thumb!' },
  M: { name: 'Letter M', instructions: ['Hold your hand with your palm facing you', 'Tuck your thumb under your first three fingers', 'Your thumb should be hidden by your fingers', 'Your pinky sticks out on the side'], tip: 'Think of the "M" sign as hiding your thumb under your first three fingers.' },
  N: { name: 'Letter N', instructions: ['Hold your hand with your palm facing you', 'Tuck your thumb under your first two fingers', 'Your thumb should be hidden by your index and middle fingers', 'Your ring finger and pinky stick out'], tip: 'Similar to M but with two fingers over thumb — shows the two humps of N.' },
  O: { name: 'Letter O', instructions: ['Curve your fingers to touch your thumb', 'Form a round "O" shape with your hand', 'Keep your palm facing forward', 'All fingers touch your thumb tip'], tip: 'The "O" looks like a circle. All fingertips touch your thumb to make a round O.' },
  P: { name: 'Letter P', instructions: ['Make the "K" sign but point it downward', 'Point your index and middle fingers down', 'Your thumb sticks up between them', 'Keep your hand angled downward'], tip: 'The "P" is just like the "K" but pointing down.' },
  Q: { name: 'Letter Q', instructions: ['Make the "G" sign and point downward', 'Point your index finger downward', 'Your thumb and other fingers form a circle below', 'Your hand faces sideways and down'], tip: 'The "Q" is like "G" but pointing down. The circle with finger makes the Q tail.' },
  R: { name: 'Letter R', instructions: ['Cross your middle finger over your index finger', 'Keep them both extended upward', 'Tuck your thumb over your other fingers', 'Hold your palm forward'], tip: 'The "R" shows crossed fingers — like making the letter R for "Respect".' },
  S: { name: 'Letter S', instructions: ['Make a fist with all fingers wrapped over your thumb', 'Keep your thumb across your fingers', 'Your fingers cover your thumb completely', 'Hold your fist facing forward'], tip: 'The "S" looks like a fist with thumb wrapped over. Like squeezing something in your hand.' },
  T: { name: 'Letter T', instructions: ['Make a fist with your thumb between your index and middle fingers', 'Your thumb sticks up between the two fingers', 'Your index finger touches the side of your thumb', 'Hold your palm forward'], tip: 'The "T" has thumb poking up between fingers — like a T with a crossbar.' },
  U: { name: 'Letter U', instructions: ['Hold up your index and middle fingers together', 'Point them straight up', 'Keep them close together like a "U" shape', 'Hold your palm forward'], tip: 'The "U" is two fingers straight up — like the letter U has two vertical lines.' },
  V: { name: 'Letter V', instructions: ['Hold up your index and middle fingers in a V shape', 'Spread them apart like a peace sign', 'Point them upward', 'Keep your other fingers and thumb tucked'], tip: 'The "V" is the peace sign! Just make a V shape with two fingers — like Victory!' },
  W: { name: 'Letter W', instructions: ['Hold up your three middle fingers', 'Spread them slightly apart (index, middle, ring)', 'Your thumb touches your pinky', 'Your fingers form a W shape'], tip: 'The "W" has three fingers up — makes the three peaks of the letter W!' },
  X: { name: 'Letter X', instructions: ['Make a fist with your index finger curled', 'Hook your middle finger over your index finger', 'Keep them crossed like an X', 'Hold your palm forward'], tip: 'The "X" is made by crossing your index and middle fingers — like the letter X!' },
  Y: { name: 'Letter Y', instructions: ['Extend your thumb and pinky finger', 'Keep your other three fingers curled in', 'Your hand forms a Y shape', 'Hold your palm forward'], tip: 'The "Y" is the hang loose sign! Like saying "Y" for "Yeah!"' },
  Z: { name: 'Letter Z', instructions: ['Start with your index finger pointing up', 'Draw a Z in the air with your finger', 'Go across, then diagonal down, then across', 'Use a chopping motion to make each stroke'], tip: 'The "Z" is traced in the air! It\'s the only letter you draw with your finger.' },
};

const DIGIT_DATA = {
  '0': { name: 'Zero', instructions: ['Make a circle with your thumb and index finger', 'Keep your other three fingers spread out', 'Your palm faces forward', 'The circle looks like the number 0'], tip: 'Zero is the "OK" sign — make a circle with thumb and index!' },
  '1': { name: 'One', instructions: ['Hold up just your index finger', 'Point it upward', 'Keep your other fingers curled in', 'Your thumb rests on your folded fingers'], tip: 'One is simple — just point up with your index finger!' },
  '2': { name: 'Two', instructions: ['Hold up your index and middle fingers', 'Keep them close together or slightly spread', 'Point them upward like a V', 'Your thumb and other fingers are tucked'], tip: 'Two is peace sign! Two fingers up means 2.' },
  '3': { name: 'Three', instructions: ['Hold up your index, middle, and ring fingers', 'Keep them spread slightly apart', 'Your thumb touches your pinky', 'Your fingers look like three lines'], tip: 'Three shows three fingers up — like the number 3!' },
  '4': { name: 'Four', instructions: ['Hold up four fingers: index, middle, ring, pinky', 'Keep them spread like a fan', 'Your thumb tucks under your fingers', 'Your palm faces forward'], tip: 'Four is showing all four fingers! Like counting to 4.' },
  '5': { name: 'Five', instructions: ['Hold up all five fingers', 'Spread them all apart like a star', 'Keep your thumb out to the side', 'Your palm faces forward'], tip: 'Five is showing your whole hand — all five fingers spread!' },
  '6': { name: 'Six', instructions: ['Hold your hand with fingers curled', 'Touch your thumb to your pinky tip', 'Keep your other fingers extended and touching', 'Your thumb and pinky make a circle on the side'], tip: 'Six is thumb touching pinky with other fingers extended!' },
  '7': { name: 'Seven', instructions: ['Hold up your thumb and index finger in an L shape', 'Keep your other three fingers extended upward', 'Hold your palm forward', 'Your thumb and index make a 90-degree angle'], tip: 'Seven looks like a gun — thumb and index make L with three fingers up!' },
  '8': { name: 'Eight', instructions: ['Hold up your index finger and thumb', 'Touch them together at the tips', 'Keep your other three fingers extended upward', 'Your index and thumb make a circle'], tip: 'Eight is like the "8" ball — index thumb circle with three fingers up!' },
  '9': { name: 'Nine', instructions: ['Hold up your index finger pointing up', 'Keep your other fingers curled in', 'Your thumb crosses over your middle finger', 'Your index finger curves slightly'], tip: 'Nine is index up with thumb crossing over! Looks like the number 9.' },
};


const WORDS_DATA = {
  'HELLO': { name: 'Hello', instructions: ['Raise your dominant hand to your forehead', 'Fingers should be together and extended', 'Move your hand away from your forehead in a small outward arc'], tip: 'Similar to a friendly salute.' },
  'THANK YOU': { name: 'Thank You', instructions: ['Start with the fingers of your dominant hand near your chin or lips', 'Keep your hand flat', 'Move your hand forward and slightly down toward the person you are thanking'], tip: 'Like blowing a kiss, but keeping your hand flat.' },
  'PLEASE': { name: 'Please', instructions: ['Place your flat right hand over the center of your chest', 'Make sure your fingers are together', 'Move your hand in a circular motion (clockwise) against your chest'], tip: 'Rub your chest gently in a circle.' },
  'YES': { name: 'Yes', instructions: ['Make a fist with your dominant hand', 'Raise and lower your fist by bending at the wrist', 'It should mimic the motion of a head nodding'], tip: 'Think of your fist as a head nodding "yes".' },
  'NO': { name: 'No', instructions: ['Extend your index and middle fingers', 'Extend your thumb to the side', 'Snap your index and middle fingers down to tap your thumb', 'Repeat the snapping motion once or twice'], tip: 'Like the mouth of a dog snapping shut.' },
  'SORRY': { name: 'Sorry', instructions: ['Make an "A" handshape (a fist with your thumb resting on the side)', 'Place your fist over the center of your chest', 'Rub your chest in a circular motion'], tip: 'Similar to "Please", but with a closed fist instead of a flat hand.' },
  
  // -- FAMILY --
  'MOM': { name: 'Mom', instructions: ['Open your hand', 'Tap your thumb on your chin twice'], tip: 'Female signs are on the lower face.' },
  'DAD': { name: 'Dad', instructions: ['Open your hand', 'Tap your thumb on your forehead twice'], tip: 'Male signs are on the upper face.' },
  'BOY': { name: 'Boy', instructions: ['Bring your thumb and fingers together at your forehead', 'Mimic grabbing the brim of a baseball cap'], tip: 'Think of grabbing a hat bill.' },
  'GIRL': { name: 'Girl', instructions: ['Make an A-handshape', 'Slide your thumb down your jawline to your chin'], tip: 'Think of bonnet strings on the cheek.' },
  'MARRIAGE': { name: 'Marriage', instructions: ['Clasp both hands together', 'Dominant hand wraps over the top'], tip: 'Holding hands together forever.' },
  'BROTHER': { name: 'Brother', instructions: ['Make L shapes with both hands', 'Touch dominant thumb to forehead', 'Bring it down to rest on the non-dominant hand'], tip: 'Combines BOy and SAME.' },
  'SISTER': { name: 'Sister', instructions: ['Make L shapes with both hands', 'Touch dominant thumb to jawline', 'Bring it down to rest on the non-dominant hand'], tip: 'Combines GIRL and SAME.' },
  'GRANDMA': { name: 'Grandma', instructions: ['Sign MOM on chin', 'Bounce hand forward twice'], tip: 'Mom + one generation away.' },
  'GRANDPA': { name: 'Grandpa', instructions: ['Sign DAD on forehead', 'Bounce hand forward twice'], tip: 'Dad + one generation away.' },
  'AUNT': { name: 'Aunt', instructions: ['Make an A-handshape', 'Shake it gently next to your cheek/jawline'], tip: 'A near the female zone.' },
  'UNCLE': { name: 'Uncle', instructions: ['Make a U-handshape', 'Shake it gently next to your temple/forehead'], tip: 'U near the male zone.' },
  'BABY': { name: 'Baby', instructions: ['Cross your arms loosely', 'Mimic rocking a baby in your arms'], tip: 'Like holding a baby.' },
  'SINGLE': { name: 'Single', instructions: ['Hold up your index finger', 'Move it in small outward circles near your shoulder'], tip: 'One finger for single.' },
  'DIVORCED': { name: 'Divorced', instructions: ['Hold both D-handshapes together', 'Pull them sharply apart and turn outwards'], tip: 'D shapes breaking apart.' },
  
  // -- PLACES --
  'HOME': { name: 'Home', instructions: ['Make a flat O-handshape', 'Touch your mouth/chin, then touch your cheek near your ear'], tip: 'Where you eat and sleep.' },
  'WORK': { name: 'Work', instructions: ['Make fists with both hands', 'Tap dominant wrist over the back of non-dominant wrist twice'], tip: 'Hands busy at work.' },
  'SCHOOL': { name: 'School', instructions: ['Hold hands flat', 'Clap them together twice horizontally'], tip: 'A teacher clapping for attention.' },
  'STORE': { name: 'Store', instructions: ['Pinch your fingers together pointing downwards on both hands', 'Swing both wrists outwards twice'], tip: 'Displaying items on a rack.' },
  'CHURCH': { name: 'Church', instructions: ['Make a C-handshape with dominant hand', 'Tap it on the back of your flat non-dominant hand twice'], tip: 'Building a church on a rock.' },
  
  // -- TIME --
  'DAY': { name: 'Day', instructions: ['Rest dominant elbow on non-dominant fingertips', 'Lower dominant hand down to resting arm'], tip: 'Sun setting over the horizon.' },
  'NIGHT': { name: 'Night', instructions: ['Hold non-dominant arm horizontal', 'Bring dominant hand over and down, wrists crossing'], tip: 'Sun dropping completely out of sky.' },
  'WEEK': { name: 'Week', instructions: ['Point dominant index finger', 'Slide it across flat non-dominant palm from heel to fingertips'], tip: 'A row on a calendar.' },
  'MONTH': { name: 'Month', instructions: ['Hold non-dominant index finger up', 'Slide dominant index finger down the back of it'], tip: 'A column on a calendar.' },
  'YEAR': { name: 'Year', instructions: ['Make two fists', 'Revolve dominant fist around the other to land on top'], tip: 'The earth rotating the sun once.' },
  'TODAY': { name: 'Today (Now)', instructions: ['Make Y-handshapes with both hands', 'Drop them down firmly once in front of you'], tip: 'Right here, right now.' },
  'FINISH': { name: 'Finish (All Done)', instructions: ['Hold hands up, palms facing you', 'Flip hands sharply so palms face out'], tip: 'Throwing away what is done.' },

  // -- TEMPERATURE --
  'HOT': { name: 'Hot', instructions: ['Form a claw shape', 'Place it over your mouth and quickly turn it away downwards'], tip: 'Spitting out hot food.' },
  'COLD': { name: 'Cold', instructions: ['Make S-fists', 'Hold arms tight and shiver your hands'], tip: 'Shivering from the cold.' },

  // -- FOOD --
  'WATER': { name: 'Water', instructions: ['Make a W-handshape', 'Tap your index finger on your chin twice'], tip: 'W on chin for water.' },
  'HUNGRY': { name: 'Hungry', instructions: ['Make a C-handshape', 'Place it high on chest and slide down to stomach'], tip: 'Food going down an empty stomach.' },
  'APPLE': { name: 'Apple', instructions: ['Make an A-handshape', 'Press knuckle of thumb into cheek and twist'], tip: 'A shiny red apple cheek.' },
  'MILK': { name: 'Milk', instructions: ['Make a fist and release it repeatedly like squeezing something'], tip: 'Milking a cow.' },

  // -- FEELINGS --
  'HAPPY': { name: 'Happy', instructions: ['Hold hands flat', 'Brush them upwards repeatedly on your chest'], tip: 'Feelings bubbling up.' },
  'ANGRY': { name: 'Angry', instructions: ['Form claw hands', 'Pull them forcefully away from your chest/face'], tip: 'Ripping anger out.' },
  'SAD': { name: 'Sad', instructions: ['Hold both hands open', 'Bring them down slowly across your face'], tip: 'A falling face.' },
  'LOVE': { name: 'Love', instructions: ['Cross both arms firmly over your chest', 'Make closed fists'], tip: 'Hugging someone you love.' },

  // -- ANIMALS --
  'CAT': { name: 'Cat', instructions: ['Pinch index and thumb on your cheeks', 'Pull outwards'], tip: 'Pulling cat whiskers.' },
  'DOG': { name: 'Dog', instructions: ['Slap your leg', 'Then snap your fingers'], tip: 'Calling a dog.' },

  // -- REQUESTED ANIMATIONS --
  'HERE': { name: 'Here', instructions: ['Hold both hands flat, palms up', 'Make small circular motions in front of you'], tip: 'Right in this spot.' },
  'CHILD': { name: 'Child', instructions: ['Hold hand flat, palm down', 'Pat the air twice slightly to the side'], tip: 'Patting the head of a short child.' },
  'WELCOME': { name: 'Welcome', instructions: ['Hold dominant hand slightly out, palm up', 'Sweep it inward toward your waist'], tip: 'Inviting someone inside.' },
  'SAME': { name: 'Same', instructions: ['Make a Y-handshape', 'Slide it back and forth horizontally'], tip: 'Things align.' },
};


export default function AlphabetSyllabus() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('alpha');
  const [selected, setSelected] = useState('A');
  const data = mode === 'alpha' ? ALPHA_DATA : mode === 'digit' ? DIGIT_DATA : WORDS_DATA;
  const keys = Object.keys(data);
  const current = data[selected];
  const currentIdx = keys.indexOf(selected);

  const prev = () => setSelected(keys[currentIdx > 0 ? currentIdx - 1 : keys.length - 1]);
  const next = () => setSelected(keys[currentIdx < keys.length - 1 ? currentIdx + 1 : 0]);

  return (
    <div className="main-content" style={{ padding: '100px 20px 40px', position: 'relative', minHeight: '100vh' }}>
      {/* Decorative Background */}
      <div style={{ position: 'absolute', top: 0, left: '10%', width: '500px', height: '500px', background: 'var(--accent-blue)', filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '0', right: '0%', width: '400px', height: '400px', background: 'var(--accent-purple)', filter: 'blur(200px)', opacity: 0.1, borderRadius: '50%', zIndex: 0 }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1400px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
          <div className="glass-card" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--accent-glow)' }}>
                <i className="fa-solid fa-book-open text-primary fs-4" />
              </div>
              <div>
                <h2 className="heading-lg mb-1" style={{ fontSize: '1.8rem' }}>
                  <span className="text-gradient">ASL Syllabus</span>
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>Step-by-step hand sign instructions</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', background: 'var(--bg-main)', borderRadius: '12px', padding: '6px' }}>
                <ClickSpark>
                  <button onClick={() => { setMode('alpha'); setSelected('A'); }} style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: mode === 'alpha' ? 'var(--bg-surface)' : 'transparent',
                    color: mode === 'alpha' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: '600', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <i className="fa-solid fa-font" />A–Z
                  </button>
                </ClickSpark>
                <ClickSpark>
                  <button onClick={() => { setMode('digit'); setSelected('0'); }} style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: mode === 'digit' ? 'var(--bg-surface)' : 'transparent',
                    color: mode === 'digit' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: '600', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <i className="fa-solid fa-hashtag" />0–9
                  </button>
                </ClickSpark>
                <ClickSpark>
                  <button onClick={() => { setMode('word'); setSelected('HELLO'); }} style={{
                    padding: '8px 16px', borderRadius: '8px', border: 'none',
                    background: mode === 'word' ? 'var(--bg-surface)' : 'transparent',
                    color: mode === 'word' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: '600', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '8px'
                  }}>
                    <i className="fa-solid fa-comment" />Words
                  </button>
                </ClickSpark>
              </div>
              <ClickSpark>
                <button onClick={() => navigate('/hearaid/learn-sign')} className="btn-premium">
                  <i className="fa-solid fa-play me-2" /> Animations
                </button>
              </ClickSpark>
            </div>
          </div>
        </motion.div>

        <div className="row g-4">
          {/* Left: letter grid */}
          <div className="col-lg-3">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="glass-card">
                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: '600' }}>
                  {mode === 'alpha' ? 'Select Letter' : mode === 'digit' ? 'Select Number' : 'Select Word'}
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {keys.map(k => (
                    <ClickSpark key={k}>
                      <button onClick={() => setSelected(k)} style={{
                        height: '40px', padding: mode === 'word' ? '0 16px' : '0', width: mode === 'word' ? 'auto' : '40px', borderRadius: '10px',
                        background: selected === k ? 'var(--gradient-primary)' : 'var(--bg-surface)',
                        border: selected === k ? '1px solid transparent' : '1px solid var(--border-light)',
                        color: selected === k ? '#fff' : 'var(--text-primary)',
                        fontFamily: "'Space Grotesk', sans-serif", fontWeight: '700', fontSize: mode === 'word' ? '0.9rem' : '1.1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: selected === k ? 'var(--accent-glow)' : 'none'
                      }}>
                        {k}
                      </button>
                    </ClickSpark>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: detail */}
          <div className="col-lg-9">
            <AnimatePresence mode="wait">
              <motion.div key={selected} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                <div className="glass-card" style={{ padding: '40px' }}>

                  {/* Letter/Word display */}
                  <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    {selected.length > 1 ? (
                      <div style={{ margin: '0 auto 20px', padding: '20px 0', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="avatar-letter-text" style={{ fontSize: '3rem', wordWrap: 'break-word', letterSpacing: '2px' }}>
                          {selected}
                        </span>
                      </div>
                    ) : (
                      <div style={{
                        width: '140px', height: '140px', borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', position: 'relative',
                        boxShadow: 'var(--accent-glow)'
                      }}>
                        <div style={{ position: 'absolute', top: '-4px', left: '-4px', right: '-4px', bottom: '-4px', background: 'var(--gradient-primary)', borderRadius: '50%', zIndex: -1 }}></div>
                        <span className="avatar-letter-text">
                          {selected}
                        </span>
                      </div>
                    )}
                    <h3 className="heading-lg" style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{current.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: 0 }}>American Sign Language</p>
                  </div>

                  {/* Steps */}
                  <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: '600' }}>
                      <i className="fa-solid fa-list-ol text-gradient" />Step-by-Step Instructions
                    </label>
                    <div className="row g-4">
                      {current.instructions.map((step, i) => (
                        <div key={i} className="col-md-6">
                          <div style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', height: '100%' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-surface)', border: '1px solid var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                              {i + 1}
                            </div>
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{step}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tip */}
                  <div style={{ marginBottom: '32px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '16px', padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="fa-solid fa-lightbulb" style={{ color: 'var(--accent-cyan)', fontSize: '1.2rem' }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)', marginBottom: '8px', letterSpacing: '0.05em' }}>QUICK TIP</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0, lineHeight: 1.6, fontStyle: 'italic' }}>"{current.tip}"</p>
                    </div>
                  </div>

                  {/* Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <ClickSpark>
                      <button onClick={prev} className="btn-premium-outline">
                        <i className="fa-solid fa-chevron-left me-2" /> Previous
                      </button>
                    </ClickSpark>
                    <ClickSpark>
                      <button onClick={() => navigate('/hearaid/learn-sign')} className="btn-premium">
                        <i className="fa-solid fa-play me-2" />See Animation
                      </button>
                    </ClickSpark>
                    <ClickSpark>
                      <button onClick={next} className="btn-premium-outline">
                        Next <i className="fa-solid fa-chevron-right ms-2" />
                      </button>
                    </ClickSpark>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: '32px' }}>
          <div className="glass-card" style={{ padding: '24px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--text-secondary)', fontWeight: '600' }}>
                <i className="fa-solid fa-chart-line text-gradient" />Learning Progress
              </label>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1rem', color: 'var(--accent-cyan)' }}>
                {currentIdx + 1} / {keys.length}
              </span>
            </div>
            <div style={{ background: 'var(--bg-surface)', borderRadius: '4px', height: '6px', marginBottom: '20px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--gradient-primary)', width: `${((currentIdx + 1) / keys.length) * 100}%`, transition: 'width 0.3s ease', boxShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {keys.map((k, i) => (
                <ClickSpark key={k}>
                  <button onClick={() => setSelected(k)} style={{
                    fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '0.85rem',
                    padding: '6px 12px', borderRadius: '8px', border: '1px solid transparent', cursor: 'pointer',
                    background: i <= currentIdx ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-surface)',
                    color: i <= currentIdx ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    borderColor: k === selected ? 'var(--accent-cyan)' : 'transparent',
                    transition: 'all 0.2s',
                  }}>{k}</button>
                </ClickSpark>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
