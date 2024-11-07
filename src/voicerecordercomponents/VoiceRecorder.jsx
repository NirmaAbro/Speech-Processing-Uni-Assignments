import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";

function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [waveSurfers, setWaveSurfers] = useState([]); // Store WaveSurfer instances
  const waveformRefs = useRef([]); // Store refs for waveform containers
  const [playingIndex, setPlayingIndex] = useState(null);

  const startRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      recorder.ondataavailable = (event) => {
        const audioBlob = event.data;
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURLs((prevURLs) => [...prevURLs, { url: audioUrl, blob: audioBlob }]);
      };

      recorder.start();
      setRecording(true);
    } else {
      alert("Your browser doesn't support audio recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const createWaveform = (url, index) => {
    const waveSurfer = WaveSurfer.create({
      container: waveformRefs.current[index],
      waveColor: "#ccc",
      progressColor: "#4f46e5",
      cursorColor: "#4f46e5",
      height: 80,
      barWidth: 2,
      barHeight: 1,
      responsive: true,
    });
    waveSurfer.load(url);
    return waveSurfer;
  };

  useEffect(() => {
    // Initialize waveforms for each audio recording
    const newWaveSurfers = audioURLs.map((audioData, index) => {
      return createWaveform(audioData.url, index);
    });
    setWaveSurfers(newWaveSurfers);

    return () => {
      // Cleanup WaveSurfer instances on unmount
      newWaveSurfers.forEach((waveSurfer) => waveSurfer.destroy());
    };
  }, [audioURLs]);

  const playPauseRecording = (index) => {
    if (playingIndex !== null) {
      waveSurfers[playingIndex].pause();
    }
    if (playingIndex === index) {
      setPlayingIndex(null); // Stop playback
    } else {
      waveSurfers[index].playPause(); // Toggle play/pause for selected recording
      setPlayingIndex(index);
    }
  };

  const deleteRecording = (index) => {
    setAudioURLs((prevURLs) => prevURLs.filter((_, i) => i !== index));
    setWaveSurfers((prevWaveSurfers) => {
      const updated = [...prevWaveSurfers];
      updated[index].destroy();
      return updated.filter((_, i) => i !== index);
    });
    if (index === playingIndex) {
      setPlayingIndex(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold mb-8 text-blue-600">Voice Recorder</h1>
      <div>
        {recording ? (
          <button
            onClick={stopRecording}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-500 transition duration-300"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-500 transition duration-300"
          >
            Start Recording
          </button>
        )}
      </div>

      {audioURLs.length > 0 && (
        <div className="mt-8 flex flex-col items-center w-full max-w-2xl space-y-6">
          {audioURLs.map((audioData, index) => (
            <div key={index} className="w-full">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">Recording {index + 1}</span>
                <div>
                  <button
                    onClick={() => playPauseRecording(index)}
                    className={`px-4 py-2 rounded-lg shadow-md transition duration-300 ${
                      playingIndex === index ? "bg-yellow-500" : "bg-blue-600"
                    } text-white mr-4`}
                  >
                    {playingIndex === index ? "Pause" : "Play"}
                  </button>
                  <button
                    onClick={() => deleteRecording(index)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-500 transition duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Waveform Container */}
              <div ref={(el) => (waveformRefs.current[index] = el)} className="mt-2"></div>

              {/* Download Button */}
              <a
                href={audioData.url}
                download={`Recording-${index + 1}.mp3`}
                className="text-blue-600 mt-2 inline-block"
              >
                Download Recording {index + 1}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
