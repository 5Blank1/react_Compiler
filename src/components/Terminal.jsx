import React, { useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { compileSourceCode } from "../utils/utils.js";

const Terminal = ({ editorRef, setTerminalOutput }) => {
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const runCode = () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;

    try {
      setIsLoading(true);

      const result = compileSourceCode(sourceCode);

      if (!result.success) {
        const errorMessages = result.errors
          .map((error) => `Строка ${error.line}: ${error.message}`)
          .join("\n");
        setOutput(`Ошибки синтаксиса:\n${errorMessages}`);
        setTerminalOutput(`Ошибки синтаксиса:\n${errorMessages}`);
        setIsError(true);
      } else {
        const lexemes = JSON.stringify(result.lexemes, null, 2);
        setOutput(lexemes);
        setTerminalOutput(lexemes);
        setIsError(false);
      }
    } catch (e) {
      console.error(e);
      setOutput("Произошла непредвиденная ошибка.");
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="100%">
      <Text mb={2} fontSize="lg">
        Terminal
      </Text>
      <Button
        variant="outline"
        colorScheme="green"
        isLoading={isLoading}
        mb={4}
        onClick={runCode}
      >
        Run code
      </Button>
      <Box
        height="30vh"
        p={2}
        color={isError ? "red.400" : ""}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
        whiteSpace="pre-wrap"
        overflowY="auto"
      >
        {output ? output : 'Click "Run Code" to see output here'}
      </Box>
    </Box>
  );
};

export default Terminal;
