import { useState, useEffect } from "react";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";

    recognitionInstance.onresult = (event) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      setTranscript(finalTranscript.trim());
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    setRecognition(recognitionInstance);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (e) => audioChunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/wav" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(audioChunks);
      if (recognition) recognition.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (mediaRecorder) {
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunks, { type: "audio/wav" });
          setAudioBlob(blob);
          setMediaRecorder(null);
          resolve({ audioBlob: blob, transcript });
        };
        mediaRecorder.stop();
      }
      if (recognition) {
        recognition.stop();
      }
      setIsRecording(false);
    });
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    transcript,
    setTranscript,
  };
};
