// Celebration sound effects using Web Audio API
export const playCelebrationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a cheerful ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (major chord)
    const duration = 0.15;
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + (index * duration);
      
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  } catch (error) {
    console.log('Audio not supported');
  }
};

export const playSuccessChime = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Two-tone success chime
    const notes = [783.99, 1046.50]; // G, C
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'triangle';
      
      const startTime = audioContext.currentTime + (index * 0.2);
      
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  } catch (error) {
    console.log('Audio not supported');
  }
};

export const playReferralSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Fun bouncy sound for referrals
    const notes = [659.25, 783.99, 659.25, 1046.50]; // E, G, E, C
    const duration = 0.12;
    
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      const startTime = audioContext.currentTime + (index * duration);
      
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  } catch (error) {
    console.log('Audio not supported');
  }
};

export const playSparkleSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Magical sparkle/ding sound - high pitched twinkling
    const sparkleNotes = [
      { freq: 2093.00, delay: 0, duration: 0.08 },     // C7
      { freq: 2637.02, delay: 0.05, duration: 0.1 },   // E7
      { freq: 3135.96, delay: 0.1, duration: 0.12 },   // G7
      { freq: 4186.01, delay: 0.15, duration: 0.15 },  // C8
      { freq: 3520.00, delay: 0.25, duration: 0.2 },   // A7 (resolve)
    ];
    
    sparkleNotes.forEach(({ freq, delay, duration }) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      const startTime = audioContext.currentTime + delay;
      
      // Quick attack, gentle decay for sparkle effect
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
    
    // Add a soft bell undertone
    const bellOsc = audioContext.createOscillator();
    const bellGain = audioContext.createGain();
    bellOsc.connect(bellGain);
    bellGain.connect(audioContext.destination);
    bellOsc.frequency.value = 1046.50; // C6
    bellOsc.type = 'triangle';
    bellGain.gain.setValueAtTime(0.15, audioContext.currentTime);
    bellGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    bellOsc.start(audioContext.currentTime);
    bellOsc.stop(audioContext.currentTime + 0.4);
    
  } catch (error) {
    console.log('Audio not supported');
  }
};
