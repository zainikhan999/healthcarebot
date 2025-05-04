// App.js (or chatbot.js)
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "./Header.jsx";
import Message from "./Message.jsx";
import InputArea from "./InputArea.jsx";
import Modal from "./Modal.jsx";

export const Chatbot = () => {
  const healthQuestions = [
    "What is your age?",
    "What is your weight in kg?",
    "what is your height in cm?",
    "How often do you exercise in a week?",
    "Do you smoke or consume alcohol regularly?",
    "How many hours of sleep do you get on average?",
    "Do you have any chronic illnesses like diabetes or hypertension?",
    "What do you eat oftenly?",
    "Do you experience frequent stress or anxiety?",
    "How much water do you drink daily?",
    "Do you take any medications or supplements?",
    "Have you had a general check-up in the past year?",
    "Do you have any known allergies?",
  ];

  const [questionIndex, setQuestionIndex] = useState(0);

  const [messages, setMessages] = useState([
    {
      text:
        "👋 Hi! I'm your Preventive Health Care Bot. I will ask some questions and will generate your health summary at the end. Let's start from first question\n" +
        healthQuestions[0],
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userResponses, setUserResponses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const messagesEndRef = useRef(null);
  const [summaryText, setSummaryText] = useState("");

  const GEMINI_API_KEY = "AIzaSyAphzP-ZWnBV1Iq-oR5weu9FwwguIep4vo";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setUserResponses((prev) => [...prev, input]);
    setInput("");
    setIsLoading(true);

    const currentQuestion = healthQuestions[questionIndex];

    const prompt = `You are a Preventive Health Care Bot. A user is answering your health-related questions.

Question: "${currentQuestion}"
User Response: "${input}"

Your job is to evaluate whether the user has answered the question with clear intent. The answer does NOT have to be grammatically correct or perfectly phrased. Even partial or broken English is acceptable as long as the meaning is clear.

For example, responses like:
- "I don't exercise"
- "carbohydrates and junk food"
- "maybe 5 hours"
- "yes, diabetic"
...are all acceptable.

If the user answers the question with relevant intent, reply with: [ANSWERED]

If the response is unrelated, empty, or makes no sense in the context of the question, reply with: [REPEAT]

Only reply with [ANSWERED] or [REPEAT]. No explanation.`;

    try {
      // Make the request to the backend instead of directly contacting Gemini
      const response = await axios.post(
        "http://localhost:5000/api/getHealthSummary",
        { prompt }
      );

      const botReply =
        response.data.candidates[0]?.content?.parts[0]?.text ||
        "Sorry, I didn't understand that.";

      // Clean the response and check for relevant instructions
      const cleanedText = botReply
        .replace(/\[ANSWERED\]|\[REPEAT\]/g, "")
        .trim();

      if (botReply.includes("[ANSWERED]")) {
        // If answered, move forward with the next question
        if (questionIndex < healthQuestions.length - 1) {
          setQuestionIndex(questionIndex + 1);
          setMessages((prev) => [
            ...prev,
            { text: healthQuestions[questionIndex + 1], sender: "bot" },
          ]);
        } else {
          // Generate a summary if all questions are answered
          const summaryPrompt = `You are a Preventive Health Care Bot. Based on these answers:
${userResponses.join("\n")}

Generate a clear and friendly summary with practical health advice. The summary should be in markdown format, with headings and bullet points. Use emojis to make it engaging. The summary should be concise and easy to understand.`;

          // Request summary from the backend
          const summaryResponse = await axios.post(
            "http://localhost:5000/api/getHealthSummary",
            {
              prompt: summaryPrompt,
            }
          );

          const summaryText =
            summaryResponse.data.candidates[0]?.content?.parts[0]?.text ||
            "Thank you. Please consult a professional for detailed health advice.";

          console.log("Generated summary:", summaryText); // ✅ Debug log
          setSummaryText(summaryText);
          setMessages((prev) => [
            ...prev,
            { text: summaryText, sender: "bot" },
          ]);
          setShowModal(true);
        }
      } else if (botReply.includes("[REPEAT]")) {
        // If not understood, ask the same question again
        setMessages((prev) => [
          ...prev,
          {
            text: `It seems like I didn't quite understand that. If you're unsure, you can skip this question. Here it is again:\n\n${currentQuestion}`,
            sender: "bot",
          },
        ]);
      }
    } catch (error) {
      console.error("Backend Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Error contacting AI.", sender: "bot" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setMessages([
      {
        text: "👋 Restarting... Let's begin with a few health questions.",
        sender: "bot",
      },
    ]);
    setUserResponses([]);
    setShowModal(false);
  };

  const handleExit = () => {
    setMessages([
      {
        text: "👋 Session ended. Refresh the page to start over.",
        sender: "bot",
      },
    ]);
    setShowModal(false);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-teal-50 text-gray-800">
      <Header />
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-teal-400 scrollbar-track-teal-100">
          {messages.map((msg, idx) => (
            <Message key={idx} message={msg.text} sender={msg.sender} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <InputArea
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          handleSend={handleSend}
        />
      </main>

      {showModal && (
        <Modal
          summary={summaryText}
          handleRestart={handleRestart}
          handleExit={handleExit}
        />
      )}
    </div>
  );
};

export default Chatbot;
