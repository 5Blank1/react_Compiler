const analyzeLexemes = (sourceCode) => {
  const lexemes = [];
  const regexPatterns = {
    keyword: /\b(если|иначе|для|возврат|пока)\b/,
    identifier: /\b[А-Яа-яA-Za-z_]\w*\b/,
    number: /\b\d+\b/,
    operator: /[+\-*/%=<>!&|]/,
    punctuation: /[{}()[\],;.:]/,
    string: /(["'])(?:(?=(\\?))\2.)*?\1/,
    whitespace: /\s+/,
  };

  const lines = sourceCode.split("\n");

  lines.forEach((line, lineNumber) => {
    const tokens = line.split(/(\s+|\b)/).filter(Boolean);

    tokens.forEach((token) => {
      if (regexPatterns.keyword.test(token)) {
        lexemes.push({ type: "keyword", value: token, line: lineNumber + 1 });
      } else if (regexPatterns.identifier.test(token)) {
        lexemes.push({
          type: "identifier",
          value: token,
          line: lineNumber + 1,
        });
      } else if (regexPatterns.number.test(token)) {
        lexemes.push({ type: "number", value: token, line: lineNumber + 1 });
      } else if (regexPatterns.operator.test(token)) {
        lexemes.push({ type: "operator", value: token, line: lineNumber + 1 });
      } else if (regexPatterns.punctuation.test(token)) {
        lexemes.push({
          type: "punctuation",
          value: token,
          line: lineNumber + 1,
        });
      } else if (regexPatterns.string.test(token)) {
        lexemes.push({ type: "string", value: token, line: lineNumber + 1 });
      } else if (regexPatterns.whitespace.test(token)) {
        lexemes.push({
          type: "whitespace",
          value: token,
          line: lineNumber + 1,
        });
      }
    });
  });

  return lexemes;
};

export const convertToPostfix = (sourceCode) => {
  const output = [];
  const operatorStack = [];

  const precedence = {
    "+": 1,
    "-": 1,
    "*": 2,
    "/": 2,
    ":=": 0,
    "(": -1,
  };

  const isOperator = (token) => Object.keys(precedence).includes(token);

  const processExpression = (tokens) => {
    tokens.forEach((token) => {
      if (!isNaN(parseFloat(token)) || /^[a-zA-Z_]\w*$/.test(token)) {
        // Число или переменная
        output.push(token);
      } else if (token === "(") {
        operatorStack.push(token);
      } else if (token === ")") {
        while (
          operatorStack.length &&
          operatorStack[operatorStack.length - 1] !== "("
        ) {
          output.push(operatorStack.pop());
        }
        operatorStack.pop(); // Убираем "("
      } else if (isOperator(token)) {
        // Обработка операторов с учетом приоритета
        while (
          operatorStack.length &&
          precedence[operatorStack[operatorStack.length - 1]] >=
            precedence[token] &&
          operatorStack[operatorStack.length - 1] !== "("
        ) {
          output.push(operatorStack.pop());
        }
        operatorStack.push(token);
      }
    });

    // Сбрасываем оставшиеся операторы
    while (operatorStack.length) {
      output.push(operatorStack.pop());
    }
  };

  const lines = sourceCode.split("\n").map((line) => line.trim());

  lines.forEach((line) => {
    if (line.startsWith("Int") || line === "Begin" || line === "End") {
      return; // Пропускаем служебные строки
    }

    const tokens = line.match(/\d+\.\d+|\d+|[a-zA-Z_]\w*|:=|[+\-*/^()]/g);

    if (tokens.includes(":=")) {
      const assignmentIndex = tokens.indexOf(":=");
      const variable = tokens[assignmentIndex - 1]; // Переменная перед :=
      const expressionTokens = tokens.slice(assignmentIndex + 1); // Выражение после :=

      // Обрабатываем правую часть выражения
      processExpression(expressionTokens);

      // Добавляем правую часть выражения в output
      output.push(variable); // Добавляем переменную
      output.push(":="); // Добавляем оператор присваивания
    } else {
      // Если нет присваивания, просто обрабатываем выражение
      processExpression(tokens);
    }
  });

  return output.join(" ");
};

export const generateBytecode = (sourceCode) => {
  const bytecode = [];
  const lines = sourceCode.split("\n");

  lines.forEach((line, index) => {
    line = line.trim();

    if (line.startsWith("print")) {
      bytecode.push(`PRINT ${index + 1}: ${line}`);
    } else if (line.includes("=")) {
      bytecode.push(`ASSIGN ${index + 1}: ${line}`);
    } else if (line.startsWith("def ")) {
      bytecode.push(`FUNC_DEF ${index + 1}: ${line}`);
    } else if (line === "") {
      bytecode.push(`EMPTY_LINE ${index + 1}`);
    } else {
      bytecode.push(`LINE ${index + 1}: ${line}`);
    }
  });

  return bytecode.join("\n");
};

export const validateSyntax = (sourceCode) => {
  const errors = [];
  const lines = sourceCode.split("\n");

  // Регулярные выражения для различных ошибок
  const operatorError = /([+\-*/%=]{2,})/;

  let intEncountered = false;
  let endEncountered = false;
  let intErrorLogged = false; // флаг, чтобы избежать многократных ошибок перед Int
  let beginEncountered = false; // флаг для отслеживания 'Begin'

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Проверка на недопустимые символы
    if (/[^a-zA-Z0-9_]/.test(trimmedLine[0]) && trimmedLine[0] !== "#") {
      errors.push({
        line: index + 1,
        message: `Недопустимый символ '${trimmedLine[0]}'.`,
      });
    }

    // Проверка на некорректные символы, исключая комментарии
    const invalidSymbols = /[@#$%^&]/.exec(trimmedLine);
    if (invalidSymbols) {
      errors.push({
        line: index + 1,
        message: `Обнаружен недопустимый символ '${invalidSymbols[0]}'.`,
      });
    }

    // Проверка на недопустимые символы перед 'Int'
    if (
      !intEncountered &&
      !intErrorLogged &&
      !/^Int\b/.test(trimmedLine) &&
      trimmedLine !== ""
    ) {
      const invalidPrefix = trimmedLine.match(/^[^\s]*\s*/)[0].trim();
      errors.push({
        line: index + 1,
        message: `Недопустимая конструкция '${invalidPrefix}' перед 'Int'.`,
      });
      intErrorLogged = true; // логируем единожды, чтобы не дублировать ошибку
    }

    if (/^Int\b/.test(trimmedLine)) {
      intEncountered = true;

      // Проверка на наличие точки с запятой в строке с Int
      if (!trimmedLine.endsWith(";")) {
        errors.push({
          line: index + 1,
          message: `Отсутствует ';' в конце строки.`,
        });
      }
    }

    // Проверка на наличие 'Begin'
    if (/^Begin\b/.test(trimmedLine)) {
      beginEncountered = true;
    }

    // Проверка на лишний текст после 'End'
    if (/^End\b/.test(trimmedLine)) {
      const invalidSuffix = trimmedLine.replace(/^End\s*/, "");
      if (invalidSuffix) {
        errors.push({
          line: index + 1,
          message: `Недопустимая конструкция '${invalidSuffix}' после 'End'.`,
        });
      }
      endEncountered = true;
    } else if (endEncountered && trimmedLine !== "") {
      errors.push({
        line: index + 1,
        message: `Недопустимая конструкция '${trimmedLine}' после 'End'.`,
      });
    }

    // Пропуск комментариев и пустых строк
    if (trimmedLine.startsWith("#") || !trimmedLine) {
      return;
    }

    // Проверка на пропуск ';' в конце строк
    if (
      !/^End\b/.test(trimmedLine) &&
      !/^Begin\b/.test(trimmedLine) &&
      /:=/.test(trimmedLine) &&
      !trimmedLine.endsWith(";")
    ) {
      errors.push({
        line: index + 1,
        message: `Отсутствует ';' в конце строки.`,
      });
    }

    // Проверка на некорректное использование оператора присваивания
    if (trimmedLine.includes("=") && !trimmedLine.includes(":=")) {
      errors.push({
        line: index + 1,
        message: `Некорректное использование оператора присваивания. Используйте ':=' вместо '='.`,
      });
    }

    // Проверка на дублирующиеся операторы
    const operatorMatch = operatorError.exec(trimmedLine);
    if (operatorMatch) {
      errors.push({
        line: index + 1,
        message: `Обнаружен некорректный оператор '${operatorMatch[0]}'.`,
      });
    }
  });

  // Проверка на наличие 'Begin' и 'End'
  if (!beginEncountered) {
    errors.push({
      line: 0, // Здесь 0, чтобы обозначить, что это глобальная ошибка
      message: `Отсутствует 'Begin'.`,
    });
  }
  if (beginEncountered && !endEncountered) {
    errors.push({
      line: 0, //
      message: `Отсутствует 'End'.`,
    });
  }
  return errors;
};

export const compileSourceCode = (sourceCode) => {
  const errors = validateSyntax(sourceCode);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const lexemes = analyzeLexemes(sourceCode);
  const postfix = convertToPostfix(sourceCode);
  const bytecode = generateBytecode(sourceCode);

  return {
    success: true,
    lexemes,
    postfix,
    bytecode,
  };
};

export const saveToFile = (fileName, content) => {
  const element = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

// Вспомогательные функции
const isOperator = (token) => ["+", "-", "*", "/"].includes(token);
const isVariable = (token) => /^[a-zA-Z]\w*$/.test(token);

export const generateBNF = (postfixCode) => {
  const tokens = postfixCode.trim().split(/\s+/);
  const stack = [];
  let bnfCode = "";
  const variables = new Set();

  tokens.forEach((token) => {
    if (token === ":=") {
      const value = stack.pop();
      const variable = stack.pop();
      bnfCode += `    ${value} := ${variable};\n`;
      variables.add(value);
    } else if (isOperator(token)) {
      // Если токен — оператор
      const operand2 = stack.pop();
      const operand1 = stack.pop();
      stack.push(`${operand1} ${token} ${operand2}`);
    } else {
      stack.push(token);
      if (isVariable(token)) {
        variables.add(token);
      }
    }
  });

  const variableList = Array.from(variables).join(", ");
  return `Int ${variableList};\nBegin\n${bnfCode}End`;
};

export const machineCode = (postfixExpression) => {
  const commands = [];
  const notUniq = []; // Список переменных, которые уже были сохранены через STO
  const tokens = postfixExpression.split(/\s+/);
  let currentVar = null;

  for (let token of tokens) {
    if (token === ":=" && currentVar !== null) {
      if (!notUniq.includes(currentVar)) {
        commands.push(`STO ${currentVar}`); // Переменная сохраняется
        notUniq.push(currentVar); // Добавляем в список, чтобы отслеживать её
      }
      currentVar = null; // сбрасываем текущую переменную
    } else if (!isNaN(token)) {
      // Если это число, генерируем команду LIT
      commands.push(`LIT ${token}`);
    } else if (/[a-zA-Z]/.test(token)) {
      // Если это буква, то STO
      if (!notUniq.includes(token)) {
        commands.push(`STO ${token}`);
        notUniq.push(token);
      } else {
        commands.push(`LOAD ${token}`);
      }
    } else {
      switch (token) {
        case "+":
          commands.push("ADD");
          break;
        case "-":
          commands.push("SUB");
          break;
        case "*":
          commands.push("MUL");
          break;
        case "/":
          commands.push("DIV");
          break;
      }
    }
  }

  if (currentVar !== null) {
    if (!notUniq.includes(currentVar)) {
      commands.push(`STO ${currentVar}`);
    }
  }

  return commands.join("\n");
};
