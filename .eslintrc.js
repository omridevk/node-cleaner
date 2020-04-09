module.exports = {
    extends: ['prettier', 'plugin:react/recommended'],
    parser: 'babel-eslint',
    plugins: ['react'],
    rules: {
        // A temporary hack related to IDE not resolving correct package.json
        'import/no-extraneous-dependencies': 'off'
    },
    settings: {
        'import/resolver': {
            // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
            node: {},
            webpack: {
                config: require.resolve('./configs/webpack.config.eslint.js')
            }
        }
    }
};
