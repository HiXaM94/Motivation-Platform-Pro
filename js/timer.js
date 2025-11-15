class FocusTimer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.intervalId = null;
        this.currentMode = 'work'; // work, shortBreak, longBreak
        
        this.modes = {
            work: { time: 25 * 60, label: 'Focus Time' },
            shortBreak: { time: 5 * 60, label: 'Short Break' },
            longBreak: { time: 15 * 60, label: 'Long Break' }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
    }

    bindEvents() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');

        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.isRunning) {
                    this.pause();
                } else {
                    this.start();
                }
            }
            
            if (e.code === 'KeyR' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.reset();
            }
        });
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);

        this.updateButtons();
        this.showNotification('Timer Started', 'Focus session began!');
        
        // Update tab title with timer
        this.updateTabTitle();
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.intervalId);
        
        this.updateButtons();
        this.showNotification('Timer Paused', 'Focus session paused');
        
        // Clear tab title
        document.title = document.title.replace(/^\(\d+:\d+\)\s*/, '');
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.intervalId);
        
        this.timeLeft = this.modes[this.currentMode].time;
        this.totalTime = this.modes[this.currentMode].time;
        
        this.updateDisplay();
        this.updateButtons();
        this.showNotification('Timer Reset', 'Timer has been reset');
        
        // Clear tab title
        document.title = document.title.replace(/^\(\d+:\d+\)\s*/, '');
    }

    tick() {
        this.timeLeft--;
        
        if (this.timeLeft <= 0) {
            this.completeSession();
            return;
        }
        
        this.updateDisplay();
        this.updateTabTitle();
        
        // Play tick sound every minute for feedback
        if (this.timeLeft % 60 === 0) {
            this.playTickSound();
        }
    }

    completeSession() {
        clearInterval(this.intervalId);
        this.isRunning = false;
        
        this.playCompletionSound();
        this.showCompletionNotification();
        this.autoStartNextSession();
        
        // Update stats
        this.updateStats();
    }

    autoStartNextSession() {
        // Auto-start break after work session
        if (this.currentMode === 'work') {
            setTimeout(() => {
                this.switchMode('shortBreak');
                this.start();
                this.showNotification('Break Time', 'Starting short break automatically');
            }, 2000);
        } 
        // Auto-start work after break
        else {
            setTimeout(() => {
                this.switchMode('work');
                this.showNotification('Back to Work', 'Break completed. Ready for next focus session?');
            }, 2000);
        }
    }

    switchMode(mode) {
        if (this.modes[mode]) {
            this.currentMode = mode;
            this.timeLeft = this.modes[mode].time;
            this.totalTime = this.modes[mode].time;
            this.updateDisplay();
            
            // Update UI to show current mode
            this.updateModeIndicator();
        }
    }

    updateDisplay() {
        const display = document.getElementById('timerDisplay');
        if (display) {
            display.textContent = this.formatTime(this.timeLeft);
            
            // Add visual feedback for low time
            if (this.timeLeft < 60) {
                display.style.color = 'var(--danger)';
                display.classList.add('pulse');
            } else {
                display.style.color = '';
                display.classList.remove('pulse');
            }
        }
        
        // Update progress if progress element exists
        this.updateProgress();
    }

    updateProgress() {
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        // You can update a progress bar here if needed
    }

    updateButtons() {
        const startBtn = document.getElementById('startTimer');
        const pauseBtn = document.getElementById('pauseTimer');
        const resetBtn = document.getElementById('resetTimer');

        if (startBtn) {
            if (this.isRunning) {
                startBtn.disabled = true;
                startBtn.innerHTML = '<i class="fas fa-play"></i> Running';
            } else if (this.isPaused) {
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
            } else {
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
            }
        }

        if (pauseBtn) {
            pauseBtn.disabled = !this.isRunning;
        }

        if (resetBtn) {
            resetBtn.disabled = this.isRunning;
        }
    }

    updateModeIndicator() {
        // You can implement mode switching UI here
        console.log(`Switched to ${this.currentMode} mode`);
    }

    updateTabTitle() {
        const timeString = this.formatTime(this.timeLeft);
        const modeLabel = this.modes[this.currentMode].label;
        
        if (this.isRunning) {
            document.title = `(${timeString}) ${modeLabel} - Motivation Hub`;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    playTickSound() {
        // Simple tick sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.log('Audio context not supported');
        }
    }

    playCompletionSound() {
        // Play completion sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 523.25; // C5
            oscillator.type = 'sine';
            gainNode.gain.value = 0.2;
            
            oscillator.start();
            
            // Simple melody: C5 - G4 - C5
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.4);
            
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.6);
            oscillator.stop(audioContext.currentTime + 0.6);
        } catch (error) {
            console.log('Audio context not supported');
        }
    }

    showNotification(title, message) {
        // Use the app's notification system
        if (window.motivationApp && typeof window.motivationApp.showNotification === 'function') {
            window.motivationApp.showNotification(title, message);
        } else {
            // Fallback notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, { body: message });
            }
        }
    }

    showCompletionNotification() {
        const message = this.currentMode === 'work' 
            ? 'Great job! Focus session completed. Time for a break!'
            : 'Break time over! Ready for your next focus session?';
            
        this.showNotification('Session Complete', message);
    }

    updateStats() {
        // Update productivity stats when session completes
        if (this.currentMode === 'work') {
            // Increment completed focus sessions
            console.log('Focus session completed - stats updated');
        }
    }

    // Public methods for external control
    setMode(mode) {
        if (this.modes[mode] && !this.isRunning) {
            this.switchMode(mode);
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            timeLeft: this.timeLeft,
            currentMode: this.currentMode,
            formattedTime: this.formatTime(this.timeLeft)
        };
    }
}