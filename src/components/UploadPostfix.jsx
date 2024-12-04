import React, { useState } from "react";
import { Box, Text, Input } from "@chakra-ui/react";
import { generateBNF } from "../utils/utils.js";

const UploadPostfix = () => {
  const [bnfCode, setBnfCode] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const postfixCode = e.target.result;
        const bnf = generateBNF(postfixCode);
        setBnfCode(bnf);
      };

      reader.readAsText(file);
    }
  };

  return (
    <Box padding={5} border="1px solid #ddd" borderRadius={4} mb={5}>
      <Text fontSize="xl" mb={4}>
        Upload Postfix Expression
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
        Generated BNF Code:
      </Text>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontSize: "14px",
          whiteSpace: "pre-wrap",
          overflowX: "auto",
        }}
      >
        {bnfCode || "Здесь будет сгенерированный BNF-код."}
      </pre>
    </Box>
  );
};

export default UploadPostfix;
