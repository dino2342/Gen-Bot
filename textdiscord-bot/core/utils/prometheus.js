const crypto = require('node:crypto');

const IDENTIFIER_PREFIX = '_';

function randomIdentifier() {
  return `${IDENTIFIER_PREFIX}${crypto.randomBytes(4).toString('hex')}`;
}

function isInsideString(source, index) {
  let inString = false;
  let stringChar = '';
  for (let i = 0; i < index; i += 1) {
    const char = source[i];
    if (char === '\\') {
      i += 1; // Skip escaped characters
      continue;
    }
    if (!inString && (char === '"' || char === '\'')) {
      inString = true;
      stringChar = char;
      continue;
    }
    if (inString && char === stringChar) {
      inString = false;
      stringChar = '';
    }
  }
  return inString;
}

function isInsideComment(source, index) {
  const lineStart = source.lastIndexOf('\n', index - 1) + 1;
  const commentIndex = source.indexOf('--', lineStart);
  if (commentIndex === -1) {
    return false;
  }
  return commentIndex < index;
}

function escapeLuaString(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function splitLuaStringLiteral(value) {
  if (value.length <= 3) {
    return `"${escapeLuaString(value)}"`;
  }

  const segments = [];
  let remaining = value;
  const minSegment = 2;

  while (remaining.length > minSegment) {
    const maxIndex = Math.max(minSegment, remaining.length - minSegment);
    const splitIndex = Math.floor(Math.random() * (maxIndex - minSegment + 1)) + minSegment;
    if (splitIndex >= remaining.length) {
      break;
    }
    const part = remaining.slice(0, splitIndex);
    segments.push(`"${escapeLuaString(part)}"`);
    remaining = remaining.slice(splitIndex);
  }

  if (remaining.length) {
    segments.push(`"${escapeLuaString(remaining)}"`);
  }

  if (segments.length === 1) {
    return segments[0];
  }

  return `(${segments.join('..')})`;
}

function renameVariables(script) {
  const variableRegex = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/gm;
  const replacements = new Map();
  let match;

  while ((match = variableRegex.exec(script)) !== null) {
    const original = match[1];
    if (!replacements.has(original)) {
      replacements.set(original, randomIdentifier());
    }
  }

  let output = script;
  replacements.forEach((obfuscated, original) => {
    const pattern = new RegExp(`\\b${original}\\b`, 'g');
    output = output.replace(pattern, obfuscated);
  });

  return output;
}

function convertNumbersToHex(script) {
  return script.replace(/\b\d+\b/g, (match, offset, fullString) => {
    if (isInsideString(fullString, offset) || isInsideComment(fullString, offset)) {
      return match;
    }
    const numberValue = Number(match);
    if (Number.isNaN(numberValue)) {
      return match;
    }
    return `0x${numberValue.toString(16).toUpperCase()}`;
  });
}

function splitStrings(script) {
  return script.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match, content, offset, fullString) => {
    if (isInsideComment(fullString, offset)) {
      return match;
    }
    return splitLuaStringLiteral(content);
  });
}

function insertJunkCode(script) {
  const junkBlocks = [];
  for (let index = 0; index < 2; index += 1) {
    const junkVariable = randomIdentifier();
    const secondaryJunk = randomIdentifier();
    junkBlocks.push(`if false then local ${junkVariable} = ${index} end`);
    junkBlocks.push(`local ${secondaryJunk} = nil`);
  }
  return `${junkBlocks.join('\n')}\n${script}\n${junkBlocks.reverse().join('\n')}\n`;
}

function obfuscateScript(script) {
  console.log('[Obfuscator] Starting obfuscation pipeline');
  let output = script;
  output = renameVariables(output);
  console.log('[Obfuscator] Variables renamed');
  output = convertNumbersToHex(output);
  console.log('[Obfuscator] Numbers converted to hex');
  output = splitStrings(output);
  console.log('[Obfuscator] Strings split');
  output = insertJunkCode(output);
  console.log('[Obfuscator] Junk code inserted');
  return output;
}

module.exports = {
  obfuscateScript,
  randomIdentifier,
};
