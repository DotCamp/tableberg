import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
	testEnvironment: 'node',
	transform: {
		'^.+.tsx?$': ['ts-jest', {}],
	},
	preset: 'ts-jest',
	testMatch: ['**/__tests__/js/**/*.test.(j)?ts(x)?'],
};

export default config;
