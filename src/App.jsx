import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaPlay, FaCode } from "react-icons/fa";
import Ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

const SimpleEditor = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const editorRef = useRef(null);
  const editorInstance = useRef(null);

  const languageSamples = {
    python: `
print("Hello Friends!")`,
    c: `#include <stdio.h>

int main() {
    // Output "Hello, Friends!" to the console
    printf("Hello, Friends!");
    return 0;
}
`,
    cpp: `#include <iostream>

int main() {
    // Output "Hello, Friends!" to the console
    std::cout << "Hello, Friends!" << std::endl;
    return 0;
}
`,
    java: `public class HelloWorld {
    public static void main(String[] args) {
        // Output "Hello, Friends!" to the console
        System.out.println("Hello, Friends!");
    }
}
`,
  };

  const languages = [
    { value: "python", label: "Python" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "java", label: "Java" },
  ];

  useEffect(() => {
    setCode(languageSamples[language]);

    if (editorInstance.current) {
      editorInstance.current.destroy();
    }

    const editor = Ace.edit(editorRef.current, {
      mode: `ace/mode/${
        language === "c" || language === "cpp" ? "c_cpp" : language
      }`,
      theme: "ace/theme/monokai",
      fontSize: 16,
      showPrintMargin: false,
      showGutter: true,
      wrap: true,
      enableBasicAutocompletion: true,
      enableLiveAutocompletion: true,
    });

    editor.setValue(languageSamples[language], -1);
    editor.getSession().on("change", () => {
      setCode(editor.getValue());
    });

    editorInstance.current = editor;

    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
      }
    };
  }, [language]);

  const handleRunCode = async () => {
    setLoading(true);
    setOutput("");
    setError("");

    try {
      const endpoint = `https://my-cloud-compiler-run-app-168268204735.asia-south1.run.app/run-${language}`;
      const response = await axios.post(
        endpoint,
        { code },
        { headers: { "Content-Type": "application/json" } }
      );
      setOutput(response.data.output || "No output returned.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data ||
          "An error occurred while running the code."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="editor-app">
      <header className="editor-header">
        <div className="header-content">
          <FaCode className="header-icon" />
          <h1>Elite Code Editor</h1>
        </div>
      </header>
      <main className="editor-container">
        <div className="editor-panel">
          <div className="toolbar">
            <select
              className="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            <button
              className="run-button"
              onClick={handleRunCode}
              disabled={loading}
            >
              <FaPlay className="run-icon" />
              {loading ? "Running..." : "Run Code"}
            </button>
          </div>
          <div ref={editorRef} className="code-editor"></div>
        </div>
        <div className="output-panel">
          <div className="output-header">
            <h3>Output</h3>
          </div>
          <div className="output-content">
            {loading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>Executing your code...</span>
              </div>
            ) : error ? (
              <pre className="error-output">{error}</pre>
            ) : output ? (
              <pre className="success-output">{output}</pre>
            ) : (
              <div className="empty-output">
                <p>Your program output will appear here</p>
                <small>Click "Run Code" to execute your program</small>
              </div>
            )}
          </div>
        </div>
      </main>
      <style jsx>{`
        .editor-app {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }
        .editor-header {
          background-color: #252526;
          padding: 1rem;
          border-bottom: 1px solid #333;
        }
        .header-content {
          display: flex;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header-icon {
          font-size: 1.5rem;
          margin-right: 1rem;
          color: #007acc;
        }
        .editor-header h1 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }
        .editor-container {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .editor-container {
            flex-direction: column;
          }
        }
        .editor-panel,
        .output-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #333;
        }
        .output-panel {
          border-right: none;
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background-color: #252526;
          border-bottom: 1px solid #333;
          height: 48px;
        }
        .output-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          background-color: #252526;
          border-bottom: 1px solid #333;
          height: 48px;
        }
        .language-select {
          padding: 0.5rem;
          background-color: #3c3c3c;
          color: #d4d4d4;
          border: 1px solid #333;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          height: 40px; /* Increased from 32px to 40px to avoid cutting */
          line-height: 1.5; /* Ensure text aligns properly */
        }
        .language-select:focus {
          outline: none;
          border-color: #007acc;
          box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.3);
        }
        .run-button {
          padding: 0.5rem 1rem;
          background-color: #007acc;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          height: 40px; /* Increased from 32px to 40px to match dropdown */
          transition: background-color 0.2s;
        }
        .run-button:hover {
          background-color: #0062a3;
        }
        .run-button:disabled {
          background-color: #3c3c3c;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .run-icon {
          margin-right: 0.5rem;
        }
        .code-editor {
          flex: 1;
          overflow: hidden;
        }
        .output-header h3 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 500;
        }
        .output-content {
          flex: 1;
          padding: 1rem;
          overflow: auto;
          font-family: "Consolas", "Courier New", monospace;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .loading-indicator {
          display: flex;
          align-items: center;
          color: #d4d4d4;
        }
        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #007acc;
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.5rem;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .success-output {
          margin: 0;
          white-space: pre-wrap;
          color: #d4d4d4;
        }
        .error-output {
          margin: 0;
          white-space: pre-wrap;
          color: #f48771;
        }
        .empty-output {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #858585;
          text-align: center;
        }
        .empty-output p {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }
        .empty-output small {
          font-size: 0.8rem;
        }
      `}</style>
    </div>
  );
};

export default SimpleEditor;
