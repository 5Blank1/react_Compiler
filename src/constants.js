export const LANGUAGE_VERSIONS = {
  java: "15.0.2",
  python: "3.10.0",
  bnf: "custom",
};

export const CODE_SNIPPETS = {
  java: `\npublic class HelloWorld {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("Hello World");\n\t}\n}\n`,
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Alex")\n`,
  bnf: `Int a, b, c;\nBegin\n    a := 10;\n    b := 20;\n    c := a + b;\nEnd`,
};
