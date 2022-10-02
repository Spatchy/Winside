module.exports = {
  "env": {
    "commonjs": true,
    "es2021": true,
    "node": true,
    "browser": true,
  },
  "extends": "eslint:recommended",
  "overrides": [
  ],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "windows"
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "never"
    ],
    "max-len": [
      "error",
      80
    ]
  }
}
