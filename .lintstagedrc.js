module.exports = {
  '**/*.{js,jsx,ts,tsx}': ['prettier --config .prettierrc.cjs --write', 'eslint --fix'],
  '**/*.{json,md}': ['prettier --config .prettierrc.cjs --write'],
};
