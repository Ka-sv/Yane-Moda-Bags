const fs = require("fs");
const path = require("path");

function listDir(dir, level = 0) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    console.log("  ".repeat(level) + "|-- " + file);
    if (stats.isDirectory()) listDir(filePath, level + 1);
  });
}

listDir("./"); // raiz do projeto
