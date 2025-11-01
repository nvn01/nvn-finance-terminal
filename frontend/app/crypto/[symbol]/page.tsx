"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { TickerTape } from "@/components/ticker-tape";
import { MarketChart } from "@/components/market-chart";
import {
	ChevronLeft,
	ChevronRight,
	Sun,
	Moon,
	X,
	Maximize2,
	Minus,
	MessageSquare,
	Star,
	Bell,
	HelpCircle,
	Activity,
} from "lucide-react";
import { cryptoData } from "@/lib/marketData";

const generateChartData = (symbol: string) => {
	const data = [] as Array<{ time: string; price: number; volume: number }>;
	const basePrice = Math.random() * 1000 + 100;
	let currentPrice = basePrice;

	for (let i = 0; i < 100; i++) {
		const time = new Date();
		time.setHours(10 + Math.floor(i / 14), (i % 14) * 4, 0, 0);

		const change = (Math.random() - 0.5) * 10;
		currentPrice += change;

		data.push({
			time: time.toISOString(),
			price: currentPrice,
			volume: Math.random() * 1000000 + 100000,
		});
	}

	return data;
};

const getMarketInfo = (symbol: string) => {
	const allData = [...cryptoData.major, ...cryptoData.altcoins];

	return allData.find(
		(item) =>
			item.id.toLowerCase().replace(/[^a-z0-9]/g, "") ===
			symbol.toLowerCase()
	);
};

export default function CryptoDetailPage() {
	const [isDarkMode, setIsDarkMode] = useState(true);
	const router = useRouter();
	const params = useParams();
	const symbol = params.symbol as string;

	const marketInfo = getMarketInfo(symbol);
	const chartData = generateChartData(symbol);

	const [showNewsPanel, setShowNewsPanel] = useState(false);
	const [showAlerts, setShowAlerts] = useState(false);
	const [isStarred, setIsStarred] = useState(false);
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => {
		const isAuthenticated = localStorage.getItem("isAuthenticated");
		if (!isAuthenticated) {
			router.push("/login");
		}

		document.body.classList.toggle("dark", isDarkMode);
		document.body.classList.toggle("light", !isDarkMode);
	}, [isDarkMode, router]);

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode);
	};

	const navigateToTab = (tab: string) => {
		router.push(`/${tab}`);
	};

	const goBack = () => {
		router.push("/crypto");
	};

	const exportChartData = () => {
		if (!marketInfo) return;
		
		const csvContent = [
			["Time", "Price", "Volume"],
			...chartData.map((item) => [
				new Date(item.time).toLocaleString(),
				item.price.toFixed(4),
				item.volume.toFixed(0),
			]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${marketInfo.id}_chart_data.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);
	};

	if (!marketInfo) {
		return (
			<div
				className={`min-h-screen font-mono ${
					isDarkMode
						? "bg-[#121212] text-white"
						: "bg-[#f0f0f0] text-black"
				}`}
			>
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">
							Market Not Found
						</h1>
						<button
							onClick={goBack}
							className="bg-[#ff9800] px-4 py-2 text-black rounded"
						>
							Go Back
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen font-mono ${
				isDarkMode
					? "bg-[#121212] text-white"
					: "bg-[#f0f0f0] text-black"
			}`}
		>
			<div
				className={`${
					isDarkMode
						? "bg-black text-white"
						: "bg-[#e0e0e0] text-black"
				} px-2 py-1 flex items-center justify-between border-b ${
					isDarkMode ? "border-gray-800" : "border-gray-300"
				}`}
			>
				<div className="flex items-center gap-4">
					<button
						onClick={() => navigateToTab("home")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						HOME
					</button>
					<button
						onClick={() => navigateToTab("indices")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						INDICES
					</button>
					<button
						onClick={() => navigateToTab("stocks")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						STOCKS
					</button>
					<button
						onClick={() => navigateToTab("forex")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						FOREX
					</button>
					<button
						onClick={() => navigateToTab("crypto")}
						className="text-yellow-500 text-xs sm:text-sm"
					>
						CRYPTO
					</button>
					<button
						onClick={() => navigateToTab("sources")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						SOURCES
					</button>
					<button
						onClick={() => navigateToTab("ai")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						AI
					</button>
				</div>
				<div className="flex items-center gap-2">
					<span className="bg-yellow-500 px-2 py-0.5 text-black hidden sm:inline-block sm:text-sm">
						{marketInfo.id}
					</span>
					<span
						className={`${
							isDarkMode
								? "text-gray-400"
								: "text-gray-600"
						} text-xs sm:text-sm`}
					>
						= Options
					</span>
					<div className="flex gap-1">
						<Minus className="h-3 w-3 sm:h-4 sm:w-4" />
						<Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
						<X className="h-3 w-3 sm:h-4 sm:w-4" />
					</div>
					<button onClick={toggleTheme} className="ml-2">
						{isDarkMode ? (
							<Sun className="h-3 w-3 sm:h-4 sm:w-4" />
						) : (
							<Moon className="h-3 w-3 sm:h-4 sm:w-4" />
						)}
					</button>
				</div>
			</div>

			<TickerTape />

			<div
				className={`flex items-center gap-2 border-b ${
					isDarkMode
						? "border-gray-700 bg-[#1a1a1a]"
						: "border-gray-300 bg-[#e6e6e6]"
				} px-2 py-1 text-xs sm:text-sm`}
			>
				<button
					onClick={goBack}
					className="flex items-center gap-1 hover:text-[#ff9800]"
				>
					<ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
					Back
				</button>
				<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
				<span>{marketInfo.id}</span>
				<span
					className={
						isDarkMode
							? "text-gray-400"
							: "text-gray-600"
					}
				>
					|
				</span>
				<span>Chart Analysis</span>
				<div className="ml-auto flex items-center gap-2">
					<button
						onClick={() =>
							setShowNewsPanel(!showNewsPanel)
						}
						className="hover:text-[#ff9800] transition-colors"
					>
						<MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
					<span className="hidden sm:inline">Message</span>
					<button
						onClick={() => setIsStarred(!isStarred)}
						className={`hover:text-[#ff9800] transition-colors ${
							isStarred ? "text-yellow-500" : ""
						}`}
					>
						<Star
							className={`h-3 w-3 sm:h-4 sm:w-4 ${
								isStarred ? "fill-current" : ""
							}`}
						/>
					</button>
					<button
						onClick={() => setShowAlerts(!showAlerts)}
						className="hover:text-[#ff9800] transition-colors relative"
					>
						<Bell className="h-3 w-3 sm:h-4 sm:w-4" />
						<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
					</button>
					<button
						onClick={() => setShowHelp(!showHelp)}
						className="hover:text-[#ff9800] transition-colors"
					>
						<HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
				</div>
			</div>

			<div
				className={`${
					isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
				} px-4 py-3 border-b ${
					isDarkMode ? "border-gray-700" : "border-gray-300"
				}`}
			>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-xl font-bold text-[#ff9800]">
							{marketInfo.id}
						</h1>
						<p
							className={`text-sm ${
								isDarkMode
									? "text-gray-400"
									: "text-gray-600"
							}`}
						>
							Cryptocurrency
						</p>
					</div>
					<div className="flex items-center gap-6">
						<div className="text-center">
							<div
								className={`text-2xl font-bold ${
									isDarkMode
										? "text-yellow-100"
										: "text-yellow-800"
								}`}
							>
								{marketInfo.value.toLocaleString(
									"en-US",
									{
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									}
								)}
							</div>
							<div className="text-xs text-gray-500">
								Current Price
							</div>
						</div>
						<div className="text-center">
							<div
								className={`text-lg font-bold ${
									marketInfo.change >= 0
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{marketInfo.change >= 0
									? "+"
									: ""}
								{marketInfo.change.toFixed(2)}
							</div>
							<div className="text-xs text-gray-500">
								Net Change
							</div>
						</div>
						<div className="text-center">
							<div
								className={`text-lg font-bold ${
									marketInfo.pctChange >= 0
										? "text-green-500"
										: "text-red-500"
								}`}
							>
								{marketInfo.pctChange >= 0
									? "+"
									: ""}
								{marketInfo.pctChange.toFixed(
									2
								)}
								%
							</div>
							<div className="text-xs text-gray-500">
								% Change
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="p-4">
				<div
					className={`${
						isDarkMode
							? "bg-[#1a1a1a] border-gray-700"
							: "bg-white border-gray-300"
					} border rounded-lg overflow-hidden`}
				>
					<div
						className={`${
							isDarkMode
								? "bg-[#2a2a2a]"
								: "bg-[#f5f5f5]"
						} px-4 py-2 border-b ${
							isDarkMode
								? "border-gray-700"
								: "border-gray-300"
						}`}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<span className="bg-[#ff9800] px-2 py-1 text-black text-sm font-bold">
									INTRADAY
								</span>
								<span
									className={`text-sm ${
										isDarkMode
											? "text-gray-300"
											: "text-gray-700"
									}`}
								>
									Previous Close:{" "}
									{(
										marketInfo.value -
										marketInfo.change
									).toFixed(2)}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-sm text-gray-500">
									11/2021 - 01/2024
								</span>
							</div>
						</div>
					</div>

					<div className="relative">
						<MarketChart
							data={chartData}
							isDarkMode={isDarkMode}
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
					<div
						className={`${
							isDarkMode
								? "bg-[#1a1a1a] border-gray-700"
								: "bg-white border-gray-300"
						} border rounded-lg p-4`}
					>
						<h3 className="font-bold mb-3 text-[#ff9800]">
							Market Statistics
						</h3>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									Open:
								</span>
								<span>
									{(
										marketInfo.value -
										marketInfo.change +
										Math.random() * 5 -
										2.5
									).toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									High:
								</span>
								<span>
									{(
										marketInfo.value +
										Math.random() * 10
									).toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									Low:
								</span>
								<span>
									{(
										marketInfo.value -
										Math.random() * 10
									).toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									Volume:
								</span>
								<span>
									{(
										Math.random() *
											1000000 +
										500000
									).toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					<div
						className={`${
							isDarkMode
								? "bg-[#1a1a1a] border-gray-700"
								: "bg-white border-gray-300"
						} border rounded-lg p-4`}
					>
						<h3 className="font-bold mb-3 text-[#ff9800]">
							Performance
						</h3>
						<div className="space-y-2">
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									1 Day:
								</span>
								<span
									className={
										marketInfo.pctChange >=
										0
											? "text-green-500"
											: "text-red-500"
									}
								>
									{marketInfo.pctChange >= 0
										? "+"
										: ""}
									{marketInfo.pctChange.toFixed(
										2
									)}
									%
								</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									1 Week:
								</span>
								<span className="text-green-500">
									+
									{(
										Math.random() * 5
									).toFixed(2)}
									%
								</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									1 Month:
								</span>
								<span className="text-red-500">
									-
									{(
										Math.random() * 3
									).toFixed(2)}
									%
								</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									YTD:
								</span>
								<span
									className={
										marketInfo.ytd >= 0
											? "text-green-500"
											: "text-red-500"
									}
								>
									{marketInfo.ytd >= 0
										? "+"
										: ""}
									{marketInfo.ytd.toFixed(
										2
									)}
									%
								</span>
							</div>
						</div>
					</div>

					<div
						className={`${
							isDarkMode
								? "bg-[#1a1a1a] border-gray-700"
								: "bg-white border-gray-300"
						} border rounded-lg p-4`}
					>
						<h3 className="font-bold mb-3 text-[#ff9800]">
							Market Status
						</h3>
						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Activity className="h-4 w-4 text-green-500" />
								<span className="text-green-500">
									Market Open
								</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									Last Update:
								</span>
								<span>{marketInfo.time}</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									Timezone:
								</span>
								<span>EST</span>
							</div>
							<div className="flex justify-between">
								<span
									className={
										isDarkMode
											? "text-gray-400"
											: "text-gray-600"
									}
								>
									Currency:
								</span>
								<span>USD</span>
							</div>
						</div>
					</div>
				</div>

				<div
					className={`mt-4 ${
						isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
					} p-3 rounded flex items-center justify-between`}
				>
					<div className="flex items-center gap-4">
						<button
							onClick={exportChartData}
							className="bg-[#ff9800] hover:bg-[#e68900] px-4 py-2 text-black text-sm font-medium rounded transition-colors"
						>
							Export Chart Data
						</button>
						<button className="text-[#ff9800] hover:underline text-sm">
							Add to Watchlist
						</button>
						<button className="text-[#ff9800] hover:underline text-sm">
							Set Price Alert
						</button>
					</div>
					<div className="text-xs text-gray-500">
						Last updated:{" "}
						{new Date().toLocaleTimeString()}
					</div>
				</div>
			</div>

			{showNewsPanel && (
				<div
					className={`fixed top-20 right-4 w-80 ${
						isDarkMode
							? "bg-[#1a1a1a] border-gray-700"
							: "bg-white border-gray-300"
					} border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto`}
				>
					<div
						className={`${
							isDarkMode
								? "bg-[#2a2a2a]"
								: "bg-[#f5f5f5]"
						} px-4 py-2 border-b ${
							isDarkMode
								? "border-gray-700"
								: "border-gray-300"
						} flex justify-between items-center`}
					>
						<h3 className="font-bold text-[#ff9800]">
							Market News
						</h3>
						<button
							onClick={() =>
								setShowNewsPanel(false)
							}
							className="text-gray-500 hover:text-white"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
					<div className="p-4 space-y-3">
						<div className="border-b border-gray-600 pb-2">
							<div className="text-sm font-medium">
								Fed Signals Rate Cut Ahead
							</div>
							<div className="text-xs text-gray-400">
								2 hours ago • Reuters
							</div>
						</div>
						<div className="border-b border-gray-600 pb-2">
							<div className="text-sm font-medium">
								Market Volatility Increases
							</div>
							<div className="text-xs text-gray-400">
								4 hours ago • Bloomberg
							</div>
						</div>
						<div className="border-b border-gray-600 pb-2">
							<div className="text-sm font-medium">
								Tech Stocks Rally Continues
							</div>
							<div className="text-xs text-gray-400">
								6 hours ago • CNBC
							</div>
						</div>
					</div>
				</div>
			)}

			{showAlerts && (
				<div
					className={`fixed top-20 right-4 w-80 ${
						isDarkMode
							? "bg-[#1a1a1a] border-gray-700"
							: "bg-white border-gray-300"
					} border rounded-lg shadow-lg z-50`}
				>
					<div
						className={`${
							isDarkMode
								? "bg-[#2a2a2a]"
								: "bg-[#f5f5f5]"
						} px-4 py-2 border-b ${
							isDarkMode
								? "border-gray-700"
								: "border-gray-300"
						} flex justify-between items-center`}
					>
						<h3 className="font-bold text-[#ff9800]">
							Price Alerts
						</h3>
						<button
							onClick={() => setShowAlerts(false)}
							className="text-gray-500 hover:text-white"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
					<div className="p-4">
						<div className="text-sm text-green-500 mb-2">
							✓ {marketInfo.id} reached target:{" "}
							{marketInfo.value.toFixed(2)}
						</div>
						<div className="text-xs text-gray-400">
							Alert triggered 15 minutes ago
						</div>
					</div>
				</div>
			)}

			{showHelp && (
				<div
					className={`fixed top-20 right-4 w-96 ${
						isDarkMode
							? "bg-[#1a1a1a] border-gray-700"
							: "bg-white border-gray-300"
					} border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto`}
				>
					<div
						className={`${
							isDarkMode
								? "bg-[#2a2a2a]"
								: "bg-[#f5f5f5]"
						} px-4 py-2 border-b ${
							isDarkMode
								? "border-gray-700"
								: "border-gray-300"
						} flex justify-between items-center`}
					>
						<h3 className="font-bold text-[#ff9800]">
							Bloomberg Functions
						</h3>
						<button
							onClick={() => setShowHelp(false)}
							className="text-gray-500 hover:text-white"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
					<div className="p-4 space-y-2 text-sm">
						<div>
							<span className="text-[#ff9800] font-mono">
								GP
							</span>{" "}
							- Get Prices
						</div>
						<div>
							<span className="text-[#ff9800] font-mono">
								CN
							</span>{" "}
							- Company News
						</div>
						<div>
							<span className="text-[#ff9800] font-mono">
								FA
							</span>{" "}
							- Financial Analysis
						</div>
						<div>
							<span className="text-[#ff9800] font-mono">
								ANR
							</span>{" "}
							- Analyst Recommendations
						</div>
						<div>
							<span className="text-[#ff9800] font-mono">
								HDS
							</span>{" "}
							- Historical Data
						</div>
						<div>
							<span className="text-[#ff9800] font-mono">
								COMP
							</span>{" "}
							- Company Comparison
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
