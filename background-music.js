class PlaylistPlayer {
    constructor() {
        this.playlist = [
            { src: 'ransom.mp3', title: 'Ransom' },
            { src: 'notlikeus.mp3', title: 'Not Like Us' }
        ];
        
        this.currentIndex = parseInt(localStorage.getItem('currentSongIndex')) || 0;
        this.audio = new Audio(this.playlist[this.currentIndex].src);
        this.audio.currentTime = parseFloat(localStorage.getItem('musicTime')) || 0;
        this.shouldPlay = localStorage.getItem('musicPlaying') === 'true';

        this.setupEvents();
        
        if (this.shouldPlay) {
            this.attemptPlay();
        }
    }

    setupEvents() {
        // Handle song ending - play next song
        this.audio.addEventListener('ended', () => {
            this.playNext();
        });

        // Save state before page unload
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('musicTime', this.audio.currentTime);
            localStorage.setItem('musicPlaying', !this.audio.paused);
            localStorage.setItem('currentSongIndex', this.currentIndex);
        });

        // Handle tab visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.shouldPlay) {
                this.attemptPlay();
            }
        });

        // Handle user interaction
        const startOnInteraction = () => {
            if (this.shouldPlay) {
                this.attemptPlay();
            }
            
            // Add click handler for future plays
            document.addEventListener('click', () => {
                if (!this.audio.paused) return;
                this.shouldPlay = true;
                this.attemptPlay();
            });

            // Remove the initial interaction listeners
            ['click', 'touchstart', 'keydown'].forEach(event => 
                document.removeEventListener(event, startOnInteraction));
        };

        // Add initial interaction listeners
        ['click', 'touchstart', 'keydown'].forEach(event => 
            document.addEventListener(event, startOnInteraction));
    }

    async attemptPlay() {
        try {
            await this.audio.play();
            this.shouldPlay = true;
            console.log(`Now playing: ${this.playlist[this.currentIndex].title}`);
        } catch (err) {
            console.log('Playback failed:', err);
            this.shouldPlay = false;
        }
    }

    playNext() {
        // Save current time and state
        localStorage.setItem('musicTime', '0'); // Reset time for next song
        localStorage.setItem('musicPlaying', 'true');
        
        // Move to next song (loop back to start if at end)
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        localStorage.setItem('currentSongIndex', this.currentIndex);
        
        // Create new audio element with next song
        const oldAudio = this.audio;
        this.audio = new Audio(this.playlist[this.currentIndex].src);
        
        // Setup ended event for new audio element
        this.audio.addEventListener('ended', () => {
            this.playNext();
        });
        
        // Start playing new song
        this.attemptPlay();
        
        // Clean up old audio element
        oldAudio.pause();
        oldAudio.src = '';
    }
}

// Create player instance when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new PlaylistPlayer();
});

// Fallback for when DOMContentLoaded already fired
if (document.readyState === 'complete') {
    window.musicPlayer = new PlaylistPlayer();
}
