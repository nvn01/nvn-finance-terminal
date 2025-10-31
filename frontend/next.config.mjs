/** @type {import('next').NextConfig} */
const nextConfig = {
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		unoptimized: true,
	},
	// Produce a self-contained server output for Docker runtime
	output: "standalone",
	// Force stable hashing to avoid Node 22 wasm hashing crash in webpack
	webpack: (config) => {
		config.output = config.output || {};
		config.output.hashFunction = "xxhash64";
		return config;
	},
	async redirects() {
		return [
			{
				source: "/tab1",
				destination: "/standard",
				permanent: true,
			},
			{
				source: "/tab1/crypto/:symbol",
				destination: "/crypto/:symbol",
				permanent: true,
			},
			{
				source: "/tab1/forex/:symbol",
				destination: "/forex/:symbol",
				permanent: true,
			},
			{
				source: "/tab1/:path*",
				destination: "/standard/:path*",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
