const { v5 } = require('uuid');

const BUILD_ID_NAMESPACE = process.env.BUILD_ID_NAMESPACE;

if (!BUILD_ID_NAMESPACE) {
	throw new Error('BUILD_ID_NAMESPACE environment variable is not defined');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	generateBuildId: async () => {
		return v5(`${Date.now()}`, BUILD_ID_NAMESPACE);
	},
};

module.exports = nextConfig;
