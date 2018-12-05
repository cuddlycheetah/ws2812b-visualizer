
var video, canvas, canvasContext, audioContext, analyser, source
function initAnalyser() {
    canvas = document.createElement('canvas')
    
    canvas.width = 600
    canvas.height = 120
    canvas.style.width = '600px'
    canvas.style.height = '120px'

    document.querySelector('.style-scope.ytd-video-primary-info-renderer').appendChild(canvas)
    video = document.querySelector('video')

    canvasContext = canvas.getContext('2d')
    
    audioContext = new AudioContext()
	analyser = audioContext.createAnalyser()
	source = audioContext.createMediaElementSource(video)
	source.connect(analyser)
    analyser.connect(audioContext.destination)
    
	frameLooper()
}

function frameLooper() {
    
	window.webkitRequestAnimationFrame(frameLooper)
	fbc_array = new Uint8Array(analyser.frequencyBinCount)
	analyser.getByteFrequencyData(fbc_array)
	canvasContext.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas
	canvasContext.fillStyle = '#00CCFF' // Color of the bars
	bars = 600 / 5
	for (var i = 0; i < bars; i++) {
		bar_x = i * 5
		bar_width = 4
		bar_height = -( (fbc_array[i] / 2) + (fbc_array[i+1] / 2) + (fbc_array[i+2] / 2) + (fbc_array[i+2] / 3) ) / 4
		//  fillRect( x, y, width, height ) // Explanation of the parameters below
		canvasContext.fillRect(bar_x, canvas.height, bar_width, bar_height)
	}
}

initAnalyser()
