import React, { useState, useRef, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { sendMessageStream } from '../services/geminiService';
import { ChatMessage } from '../types';

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    // Start a new Gemini response, initially empty or with a loading indicator
    const geminiMessageId = (Date.now() + 1).toString(); // Ensure ID is unique and after user's
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: geminiMessageId, sender: 'gemini', text: '' },
    ]);

    let fullResponse = '';
    try {
      // Clear any previous abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      await sendMessageStream(userMessage.text, (chunk) => {
        if (signal.aborted) {
          console.log('Stream aborted.');
          return;
        }
        fullResponse += chunk;
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === geminiMessageId ? { ...msg, text: fullResponse } : msg
          )
        );
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.log('Fetch aborted by user or new request.');
      } else {
        const errorMessage = (error as Error).message || 'Could not get a response.';
        console.error('Error in chat stream:', error);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === geminiMessageId ? { ...msg, text: `Error: ${errorMessage}` } : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null; // Clear the controller after use
    }
  }, [input, isLoading]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line in textarea if it were one
      handleSendMessage();
    }
  }, [handleSendMessage]);

  useEffect(() => {
    // Cleanup function for abort controller on component unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 mt-16 flex flex-col h-[calc(100vh-8rem)]"> {/* mt-16 to offset navbar */}
      <Card className="flex-1 flex flex-col mb-4 p-0 overflow-hidden">
        <h1 className="text-3xl font-extrabold text-blue-400 p-6 border-b border-gray-700">
          AI Chatbot <span className="text-gray-400 text-base ml-2">powered by Gemini</span>
        </h1>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <p className="text-center text-gray-500 italic">Ask me anything about PlayStation trophies!</p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex animate-fade-in ${ // Apply fade-in animation here
                message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg shadow-md ${message.sender === 'user'
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-700 text-gray-100'
                  }`}
              >
                <MarkdownRenderer content={message.text || 'Thinking...'} />
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-fade-in"> {/* Also animate loading spinner */}
              <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-gray-700 text-gray-100">
                <LoadingSpinner />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-6 border-t border-gray-700 flex items-center">
          <input
            type="text"
            className="flex-1 p-3 rounded-l-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            isLoading={isLoading}
            disabled={input.trim() === '' || isLoading}
            className="rounded-l-none"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotPage;