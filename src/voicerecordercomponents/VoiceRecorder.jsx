import React, { useState, useRef, useEffect } from "react";
import Graph from "./Graph"; // Import the Graph component

function VoiceRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioURLs, setAudioURLs] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [audioProgress, setAudioProgress] = useState([]); // To store audio playback data

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

  const playPauseRecording = (index) => {
    const audioElement = document.getElementById(`audio-${index}`);
    if (audioElement.paused) {
      audioElement.play();
      setPlayingIndex(index);
      // Update progress of audio playback
      trackAudioProgress(audioElement, index);
    } else {
      audioElement.pause();
      setPlayingIndex(null);
    }
  };

  const trackAudioProgress = (audioElement, index) => {
    const interval = setInterval(() => {
      if (audioElement.ended) {
        clearInterval(interval);
        setPlayingIndex(null);
      } else {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        setAudioProgress((prev) => {
          // Store progress only for the currently playing audio
          const newProgress = [...prev];
          newProgress[index] = progress;
          return newProgress;
        });
      }
    }, 100);
  };

  const deleteRecording = (index) => {
    setAudioURLs((prevURLs) => prevURLs.filter((_, i) => i !== index));
    setAudioProgress((prevProgress) => prevProgress.filter((_, i) => i !== index)); // Remove the deleted recording's progress
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

              {/* Audio Player */}
              <audio id={`audio-${index}`} src={audioData.url} />

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

      {/* Graph Component */}
      {audioProgress.length > 0 && (
        <div className="mt-12 w-full max-w-2xl">
          <Graph data={audioProgress} />
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
