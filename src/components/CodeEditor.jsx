import React, { useRef, useState } from "react";
import { Box, Button, HStack, Input } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import LanguageSelector from "./LanguageSelector.jsx";
import { CODE_SNIPPETS } from "../constants.js";
import Options from "./Options.jsx";
import UploadPostfix from "./UploadPostfix.jsx";
import TranslateToMachine from "./TranslateToMachine.jsx";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState("bnf");
  const [fileName, setFileName] = useState("code.txt");
  // const [terminalOutput, setTerminalOutput] = useState("");

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setValue(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleFileDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([value], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName || "code.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClose = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <Box>
      <Box mb={4}>
        <Input
          placeholder="Enter file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          width="200px"
          mr={4}
        />
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        <label htmlFor="file-upload">
          <Button as="span" colorScheme="cyan">
            Upload File
          </Button>
        </label>
        <Button onClick={handleFileDownload} colorScheme="teal" ml={4}>
          Save File
        </Button>
        <Button onClick={handleClose} colorScheme="blue" ml={4}>
          Close
        </Button>
      </Box>
      <HStack spacing={4}>
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            height="60vh"
            language={language}
            theme="vs-dark"
            defaultValue={CODE_SNIPPETS[language]}
            onMount={onMount}
            value={value}
            onChange={(value) => setValue(value)}
          />
        </Box>

        <Options editorRef={editorRef} />
      </HStack>
      <Box mt={4}>
        {/*<Terminal editorRef={editorRef} setTerminalOutput={setTerminalOutput} />*/}
        <UploadPostfix />
        <TranslateToMachine />
      </Box>
    </Box>
  );
};

export default CodeEditor;
