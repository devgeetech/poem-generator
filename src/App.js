import { useState } from "react";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";

import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [gptResponse, setGptResponse] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const handleSubmit = async () => {
    const prompt = `Write a poem with at least ten lines on the topic ${topic}`;
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 1,
      max_tokens: 2000,
    });

    setGptResponse(completion.data.choices[0].text);

    let data = JSON.stringify({
      voiceId: "en-US-marcus",
      text: completion.data.choices[0].text.split("\n").join(". "),
    });

    let config = {
      method: "post",
      url: `${process.env.REACT_APP_PUBLIC_ENDPOINT}/speech/generate`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        token: process.env.REACT_APP_TOKEN,
      },
      data: data,
    };

    axios(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        setAudioUrl(response.data?.audioFile);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const downloadBlob = (blob, filename) => {
    var a = document.createElement("a");
    a.download = filename;
    a.href = blob;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadResource = (url, filename) => {
    fetch(url, {
      mode: "no-cors",
    })
      .then((response) => response.blob())
      .then((blob) => {
        let blobUrl = window.URL.createObjectURL(blob);
        downloadBlob(blobUrl, filename);
      })
      .catch((e) => console.error(e));
  };

  return (
    <div className="app">
      <div className="content">
        <h1>Poem Generator</h1>
        <input
          className="prompt-input"
          onChange={(e) => setTopic(e.target.value)}
        />
        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
        {gptResponse && <div className="gpt-response">{gptResponse}</div>}
        <div>
          {gptResponse && !audioUrl && <p>Loading...</p>}
          {audioUrl && <audio controls autoPlay src={audioUrl} />}
          {audioUrl && (
            <button
              onClick={() => downloadResource(audioUrl, "downloaded_file.mp3")}
            >
              {" "}
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
