import React, { useState } from "react";
import { Box, Button, Text } from "@chakra-ui/react";
import { compileSourceCode, saveToFile } from "../utils/utils.js";

const Options = ({ editorRef }) => {
  const [output, setOutput] = useState("");

  const handleOption = (option) => {
    const code = editorRef.current.getValue();
    const result = compileSourceCode(code);

    if (!result.success) {
      const errorMessages = result.errors
        .map((error) => `Строка ${error.line}: ${error.message}`)
        .join("\n");
      setOutput(`Ошибки синтаксиса:\n${errorMessages}`);
      return;
    }

    switch (option) {
      case "lexemes":
        setOutput(JSON.stringify(result.lexemes, null, 2));
        break;
      case "postfix":
        setOutput(result.postfix);
        break;
      case "bytecode":
        setOutput(result.bytecode);
        break;
      case "savePostfix":
        saveToFile("postfix.txt", result.postfix);
        setOutput("Постфиксная запись сохранена в файл postfix.txt.");
        break;
      case "saveBytecode":
        saveToFile("bytecode.txt", result.bytecode);
        setOutput("Байт-код сохранен в файл bytecode.txt.");
        break;
      default:
        setOutput("Неизвестная опция.");
    }
  };

  return (
    <Box w="50%">
      <Text mb={2} fontSize="lg">
        Options
      </Text>
      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        onClick={() => handleOption("lexemes")}
      >
        Lexemes
      </Button>
      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        ml={4}
        onClick={() => handleOption("postfix")}
      >
        Postfix notation
      </Button>
      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        ml={4}
        onClick={() => handleOption("bytecode")}
      >
        Byte code
      </Button>
      <Button
        variant="solid"
        colorScheme="blue"
        mb={4}
        ml={4}
        onClick={() => handleOption("savePostfix")}
      >
        Save Postfix
      </Button>
      <Box
        height="60vh"
        p={2}
        border="1px solid"
        borderRadius={4}
        borderColor="#333"
        whiteSpace="pre-wrap"
        overflowY="auto"
      >
        {output || "Choose an option to see output here."}
      </Box>
    </Box>
  );
};

export default Options;
