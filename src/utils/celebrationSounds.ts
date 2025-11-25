// Celebration sound effects using Web Audio API
export const playCelebrationSound = () => {
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
};

export const playSuccessChime = () => {
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
};

export const playReferralSound = () => {
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
};
