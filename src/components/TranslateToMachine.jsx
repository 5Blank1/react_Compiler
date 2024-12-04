import React, { useState } from "react";
import { Box, Button, Textarea, Text, Input, Center } from "@chakra-ui/react";
import { machineCode } from "../utils/utils.js";

const TranslateToMachine = () => {
  const [postfixExpression, setPostfixExpression] = useState("");
  const [machineCodeResult, setMachineCodeResult] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPostfixExpression(reader.result);
      };
      reader.readAsText(file);
    }
  };

  const handleTranslate = () => {
    try {
      const result = machineCode(postfixExpression);
      const variableMap = {};
      let variableIndex = 0;

      const updatedResult = result
        .split("\n")
        .map((line) => {
          return line.replace(
            /\b(STO|LOAD)\s+([a-zA-Z])\b/g,
            (match, command, variable) => {
              if (!variableMap.hasOwnProperty(variable)) {
                variableMap[variable] = variableIndex++;
              }
              return `${command} ${variableMap[variable]}`;
            },
          );
        })
        .join("\n");

      setMachineCodeResult(updatedResult);
    } catch (error) {
      setMachineCodeResult("Ошибка при обработке выражения.");
      console.error("Ошибка:", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([machineCodeResult], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "machine_code.cod";
    link.click();
  };

  return (
    <Box padding={5} border="1px solid #ddd" borderRadius={4}>
      <Text fontSize="xl" mb={4}>
        Translate To Machine Code
      </Text>
      <Input
        type="file"
        accept=".txt"
        onChange={handleFileUpload}
        mb={4}
        padding={2}
        bg="#007BFF"
        color="white"
        border="none"
        borderRadius="4px"
      />
      <Text fontSize="lg" mb={2}>
        Загруженное выражение:
      </Text>
      <Textarea
        value={postfixExpression}
        isReadOnly
        placeholder="Здесь будет отображено выражение из файла"
        mb={4}
        rows={6}
      />
      <Center>
        <Button
          onClick={handleTranslate}
          colorScheme="green"
          size="md"
          width="auto"
          mb={4}
        >
          Перевести
        </Button>
      </Center>

      <Text fontSize="lg" mb={2}>
        Результат:
      </Text>
      <Textarea
        value={machineCodeResult}
        isReadOnly
        placeholder="Здесь будет отображен машинный код"
        mb={4}
        rows={6}
        resize="none"
        width="100%"
      />
      {machineCodeResult && (
        <Center>
          <Button
            onClick={handleDownload}
            colorScheme="teal"
            size="md"
            width="auto"
          >
            Скачать результат
          </Button>
        </Center>
      )}
    </Box>
  );
};

export default TranslateToMachine;
