export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-[#ff9800] mb-2">
					404
				</h1>
				<p className="mb-4">Page not found</p>
				<a
					href="/home"
					className="text-black bg-[#ff9800] px-4 py-2 rounded"
				>
					Go to Home
				</a>
			</div>
		</div>
	);
}

