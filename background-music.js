class BackgroundMusicPlayer {
    constructor() {
        this.audio = new Audio('ransom.mp3'); // Updated path since file is in root
        this.audio.loop = true;
        this.audioContext = null;
        this.isInitialized = false;
        
        this.lastTime = parseFloat(localStorage.getItem('musicTime')) || 0;
        this.wasPlaying = localStorage.getItem('musicPlaying') === 'true';
        
        this.initializeAudioContext();
        this.setupEventListeners();
    }

    initializeAudioContext() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        
        const source = this.audioContext.createMediaElementSource(this.audio);
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.5;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
    }

    setupEventListeners() {
        window.addEventListener('beforeunload', () => {
            localStorage.setItem('musicTime', this.audio.currentTime.toString());
            localStorage.setItem('musicPlaying', (!this.audio.paused).toString());
        });

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.wasPlaying) {
                this.audio.play();
            }
        });

        const startPlayback = async () => {
            if (!this.isInitialized) {
                await this.audioContext.resume();
                this.audio.currentTime = this.lastTime;
                
                try {
                    await this.audio.play();
                    this.isInitialized = true;
                } catch (err) {
                    console.log('Autoplay prevented:', err);
                }
            }
        };

        startPlayback();

        const userInteractionEvents = ['click', 'touchstart', 'keydown'];
        const handleUserInteraction = async () => {
            await startPlayback();
            userInteractionEvents.forEach(event => 
                document.removeEventListener(event, handleUserInteraction));
        };

        userInteractionEvents.forEach(event => 
            document.addEventListener(event, handleUserInteraction));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new BackgroundMusicPlayer();
});
