// eslint.config.js
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

// A configuração agora é um array de objetos.
// Cada objeto pode ter uma finalidade específica.
export default tseslint.config(
    // Primeiro objeto: Define as regras e configurações principais para arquivos TypeScript.
    {
        // `files` define quais arquivos essa configuração deve ser aplicada.
        files: ['**/*.ts', '**/*.cts', '**/*.mts'],

        // `extends` é onde você estende as configurações de outras bibliotecas.
        extends: [
            // Regras padrão recomendadas do ESLint.
            eslint.configs.recommended,

            // CORREÇÃO AQUI: mude de `tslint` para `tseslint`
            ...tseslint.configs.recommended,

            // Desabilita regras que podem entrar em conflito com o Prettier.
            eslintConfigPrettier,
        ],

        // `plugins` habilita plugins para serem usados nas regras.
        plugins: {
            prettier: prettierPlugin,
        },



        // `languageOptions` configura o parser e outras opções de linguagem.
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: import.meta.dirname,
            },
        },

        // `rules` sobrescreve ou adiciona regras personalizadas.
        rules: {
            // Regra que executa o Prettier como uma regra do ESLint, reportando erros de formatação.
            'prettier/prettier': 'error',

            // Exemplo: Desabilita a regra `no-unused-vars` do ESLint padrão,
            // pois o plugin `ts-eslint` já tem a sua própria, mais precisa.
            'no-unused-vars': 'off',
            "jest/no-disabled-tests": "warn",
            "jest/no-focused-tests": "error",
            "jest/no-identical-title": "error",
            "jest/prefer-to-have-length": "warn",
            "jest/valid-expect": "error"

        },
    },

    // Segundo objeto: Define arquivos e diretórios que devem ser ignorados.
    {
        // Use `ignores` para listar arquivos e diretórios a serem excluídos do linting.
        ignores: ['dist', 'node_modules'],
    },
);