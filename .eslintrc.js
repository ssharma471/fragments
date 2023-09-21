/*module.exports = {
    "env": {
        // "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
        // {
        //     "env": {
        //         "node": true
        //     },
        //     "files": [
        //         ".eslintrc.{js,cjs}"
        //     ],
        //     "parserOptions": {
        //         "sourceType": "script"
        //     }
        // }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
    }
}
*/

// .eslintrc.js

module.exports = {
    env: {
      node: true,
      commonjs: true,
      es2021: true,
      // Add this next line to configure ESLint for Jest, see:
      // https://eslint.org/docs/user-guide/configuring/language-options#specifying-environments
      jest: true,
    },
    extends: 'eslint:recommended',
    parserOptions: {
      ecmaVersion: 13,
    },
    rules: {},
  };