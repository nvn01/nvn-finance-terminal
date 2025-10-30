"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TickerTape } from "@/components/ticker-tape";
import { X, Maximize2, Sun, Moon } from "lucide-react";
import { MarketOverviewCarousel } from "@/components/market-overview-carousel";
import { StockTile } from "@/components/stock-tile";
import { marketData as standardMarketData } from "../../marketData";
import { getLatestCandles, getRangeCandles } from "../../lib/api";

// Default overview used as fallback; replaced by API on mount
const defaultOverviewData = [
	{
		name: "S&P 500",
		symbol: "SPX",
		value: 4733.77,
		change: 36.73,
		changePercent: 0.78,
		previousClose: 4697.04,
		dayRange: "4685.22 - 4745.18",
		chartData: [
			{ time: "09:00", value: 4697 },
			{ time: "10:00", value: 4705 },
			{ time: "11:00", value: 4720 },
			{ time: "12:00", value: 4715 },
			{ time: "13:00", value: 4725 },
			{ time: "14:00", value: 4730 },
			{ time: "15:00", value: 4733.77 },
		],
	},
	{
		name: "NASDAQ",
		symbol: "IXIC",
		value: 15659.41,
		change: 119.84,
		changePercent: 1.04,
		previousClose: 15539.57,
		dayRange: "15520.33 - 15680.12",
		chartData: [
			{ time: "09:00", value: 15540 },
			{ time: "10:00", value: 15580 },
			{ time: "11:00", value: 15620 },
			{ time: "12:00", value: 15610 },
			{ time: "13:00", value: 15640 },
			{ time: "14:00", value: 15650 },
			{ time: "15:00", value: 15659.41 },
		],
	},
	{
		name: "DOW JONES",
		symbol: "DJI",
		value: 36025.76,
		change: 274.24,
		changePercent: 0.81,
		previousClose: 35751.52,
		dayRange: "35720.15 - 36080.45",
		chartData: [
			{ time: "09:00", value: 35752 },
			{ time: "10:00", value: 35820 },
			{ time: "11:00", value: 35900 },
			{ time: "12:00", value: 35950 },
			{ time: "13:00", value: 35980 },
			{ time: "14:00", value: 36000 },
			{ time: "15:00", value: 36025.76 },
		],
	},
	{
		name: "FTSE 100",
		symbol: "UKX",
		value: 7373.34,
		change: 31.68,
		changePercent: 0.43,
		previousClose: 7341.66,
		dayRange: "7330.22 - 7385.91",
		chartData: [
			{ time: "09:00", value: 7342 },
			{ time: "10:00", value: 7350 },
			{ time: "11:00", value: 7365 },
			{ time: "12:00", value: 7360 },
			{ time: "13:00", value: 7370 },
			{ time: "14:00", value: 7375 },
			{ time: "15:00", value: 7373.34 },
		],
	},
	{
		name: "NIKKEI 225",
		symbol: "N225",
		value: 28798.37,
		change: 236.16,
		changePercent: 0.83,
		previousClose: 28562.21,
		dayRange: "28520.45 - 28820.12",
		chartData: [
			{ time: "09:00", value: 28562 },
			{ time: "10:00", value: 28600 },
			{ time: "11:00", value: 28650 },
			{ time: "12:00", value: 28700 },
			{ time: "13:00", value: 28750 },
			{ time: "14:00", value: 28780 },
			{ time: "15:00", value: 28798.37 },
		],
	},
];

// News data
const newsData = [
	{
		title: "Perubahan Kepemilikan Saham - (CDIA) Chandra Daya Investasi Tbk",
		source: "CNBC Indonesia",
		time: "On Wed, Jul 30",
		url: "https://www.cnbcindonesia.com/research/20250805061438-128-655035/fakta-ihsg-malah-gak-merdeka-di-agustus",
	},
	{
		title: "Penjelasan atas Volatilitas Transaksi - (SKRN) Superrame Mitra Utama Tbk",
		source: "CNBC Indonesia",
		time: "On Wed, Jul 30",
		url: "https://www.cnbcindonesia.com/market/20250804123456-17-654321/skrn-volatilitas-tinggi-saham",
	},
	{
		title: "Keterbukaan Informasi yang perlu diketahui... - (ARNA) Arwana Citramulia Tbk",
		source: "CNBC Indonesia",
		time: "On Wed, Jul 30",
		url: "https://www.cnbcindonesia.com/market/20250804111111-17-654322/arna-informasi-material",
	},
	{
		title: "5 Kebiasaan Hemat Mark Cuban yang Bantu Membangun Kekayaannya",
		source: "CNBC Indonesia",
		time: "On Wed, Jul 30",
		url: "https://www.cnbcindonesia.com/lifestyle/20250804101010-33-654323/mark-cuban-tips-hemat",
	},
	{
		title: "Intip 3 Saham Bank Plat Merah LQ45 yang Turun saat IHSG Melemah Hari Rabu (30/7)",
		source: "CNBC Indonesia",
		time: "On Wed, Jul 30",
		url: "https://www.cnbcindonesia.com/market/20250730090909-17-654324/saham-bank-plat-merah-turun",
	},
];

export default function HomePage() {
	const [isDarkMode, setIsDarkMode] = useState(true);
	const router = useRouter();
	const [currentMarketIndex, setCurrentMarketIndex] = useState(0);
	const [tiles, setTiles] = useState<any[]>([]);
	const [overview, setOverview] = useState(defaultOverviewData);

	useEffect(() => {
		const isAuthenticated = localStorage.getItem("isAuthenticated");
		if (!isAuthenticated) {
			router.push("/login");
		}

		document.body.classList.toggle("dark", isDarkMode);
		document.body.classList.toggle("light", !isDarkMode);
	}, [isDarkMode, router]);

	const handleLogout = () => {
		localStorage.removeItem("isAuthenticated");
		router.push("/login");
	};

	const navigateToTab = (tab: string) => {
		router.push(`/${tab}`);
	};

	const handleNewsClick = (url: string) => {
		window.open(url, "_blank");
	};

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode);
	};

	// Build tiles from API using the symbol lists in marketData.ts
	useEffect(() => {
		const flatten = [
			...standardMarketData.americas,
			...standardMarketData.emea,
			...standardMarketData.asiaPacific,
		];

		const makeMiniSeriesFallback = (value: number, pct: number) => {
			const points = 20;
			const base = value;
			const vol = Math.max(Math.abs(pct) * 0.003, 0.0005);
			const arr: number[] = [];
			let cur = base * (1 - (pct / 100) * 0.6);
			for (let i = 0; i < points; i++) {
				const drift = (pct >= 0 ? 1 : -1) * vol * base * (i / points) * 0.5;
				const noise = (Math.random() - 0.5) * vol * base * 2;
				cur = cur + drift + noise;
				arr.push(cur);
			}
			arr[arr.length - 1] = base;
			return arr;
		};

		const load = async () => {
			try {
				const now = new Date();
				const from = new Date(now.getTime() - 60 * 60 * 1000); // last 60 minutes

				const results = await Promise.all(
					flatten.map(async (d) => {
						const symbol = d.id;
						try {
							const latest = await getLatestCandles(symbol, 2);
							const last = latest[latest.length - 1];
							const prev = latest.length > 1 ? latest[latest.length - 2] : last;
							const price = last?.close ?? d.value;
							const change = price - (prev?.close ?? price);
							const changePercent = (prev?.close ?? 0) !== 0 ? (change / (prev?.close as number)) * 100 : 0;

							const range = await getRangeCandles(symbol, from, now);
							const chartData = range.length > 0 ? range.map((c) => c.close) : makeMiniSeriesFallback(price, changePercent);

							return {
								symbol,
								name: d.id,
								price,
								change,
								changePercent,
								chartData,
							};
						} catch (e) {
							// Fallback to existing dummy values if API fails for a symbol
							return {
								symbol,
								name: d.id,
								price: d.value,
								change: d.change,
								changePercent: d.pctChange,
								chartData: makeMiniSeriesFallback(d.value, d.pctChange),
							};
						}
					})
				);

				setTiles(results);
			} catch (err) {
				// In case of global failure, keep existing UI with dummy data
				const prepared = flatten.map((d) => ({
					symbol: d.id,
					name: d.id,
					price: d.value,
					change: d.change,
					changePercent: d.pctChange,
					chartData: makeMiniSeriesFallback(d.value, d.pctChange),
				}));
				setTiles(prepared);
			}
		};

		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Build market overview from API (SPX, IXIC, DJI, UKX, N225)
	useEffect(() => {
		const symbols = [
			{ name: "S&P 500", symbol: "SPX" },
			{ name: "NASDAQ", symbol: "IXIC" },
			{ name: "DOW JONES", symbol: "DJI" },
			{ name: "FTSE 100", symbol: "UKX" },
			{ name: "NIKKEI 225", symbol: "N225" },
		];
		const loadOverview = async () => {
			try {
				const now = new Date();
				const from = new Date(now.getTime() - 60 * 60 * 1000);
				const items = await Promise.all(
					symbols.map(async (s) => {
						try {
							const latest = await getLatestCandles(s.symbol, 2);
							const last = latest[latest.length - 1];
							const prev = latest.length > 1 ? latest[latest.length - 2] : last;
							const price = last?.close ?? 0;
							const change = price - (prev?.close ?? price);
							const changePercent = (prev?.close ?? 0) !== 0 ? (change / (prev?.close as number)) * 100 : 0;

							const range = await getRangeCandles(s.symbol, from, now);
							const closes = range.map((c) => c.close);
							const minV = closes.length ? Math.min(...closes) : price;
							const maxV = closes.length ? Math.max(...closes) : price;
							const dayRange = `${minV.toFixed(2)} - ${maxV.toFixed(2)}`;
							const chartData = closes.map((v, idx) => ({ time: String(idx), value: v }));

							return {
								name: s.name,
								symbol: s.symbol,
								value: price,
								change,
								changePercent,
								previousClose: prev?.close ?? price,
								dayRange,
								chartData,
							};
						} catch {
							const fallback = defaultOverviewData.find((x) => x.symbol === s.symbol)!;
							return { ...fallback };
						}
					})
				);
				setOverview(items);
			} catch {
				setOverview(defaultOverviewData);
			}
		};
		loadOverview();
	}, []);

	return (
		<div
			className={`min-h-screen font-mono ${
				isDarkMode
					? "bg-black text-white"
					: "bg-[#f0f0f0] text-black"
			}`}
		>
			{/* Header */}
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
					<span className="text-yellow-500 text-xs sm:text-sm">
						HOME
					</span>
					<button
						onClick={() => navigateToTab("standard")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						STANDARD
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
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						CRYPTO
					</button>
					<button
						onClick={() => navigateToTab("tab2")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						TAB 2
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
					{/* Removed watchlist refresh controls */}
					<div className="flex gap-1">
						<button
							onClick={() => {
								if (
									document.fullscreenElement
								) {
									document.exitFullscreen();
								} else {
									document.documentElement.requestFullscreen();
								}
							}}
							className="hover:text-[#ff9800] transition-colors"
						>
							<Maximize2 className="h-3 w-3 sm:h-4 sm:w-4" />
						</button>
						<button
							onClick={() => window.close()}
							className="hover:text-red-500 transition-colors"
						>
							<X className="h-3 w-3 sm:h-4 sm:w-4" />
						</button>
					</div>
					<button onClick={toggleTheme} className="ml-2">
						{isDarkMode ? (
							<Sun className="h-3 w-3 sm:h-4 sm:w-4" />
						) : (
							<Moon className="h-3 w-3 sm:h-4 sm:w-4" />
						)}
					</button>
					<button
						onClick={handleLogout}
						className="bg-red-600 px-2 py-0.5 text-white text-xs rounded ml-2"
					>
						LOGOUT
					</button>
				</div>
			</div>

			{/* Ticker Tape */}
			<TickerTape />

			{/* Main Dashboard */}
			<div className="grid grid-cols-12 gap-4 p-4 h-[calc(100vh-120px)]">
				{/* Market Overview Carousel - Left Column */}
				<div className="col-span-4 bg-black rounded-lg p-4">
					<MarketOverviewCarousel
						marketData={overview}
						currentIndex={currentMarketIndex}
						setCurrentIndex={setCurrentMarketIndex}
						isDarkMode={isDarkMode}
					/>
				</div>

				{/* News - Middle Column */}
				<div className="col-span-4 bg-black rounded-lg p-4">
					<h2 className="text-white text-lg font-bold mb-4">
						News
					</h2>
					<div className="space-y-4 overflow-y-auto h-[calc(100%-2rem)]">
						{newsData.map((news, index) => (
							<div
								key={index}
								className="border-b border-gray-600 pb-3 cursor-pointer hover:bg-gray-800 p-2 rounded transition-colors"
								onClick={() =>
									handleNewsClick(news.url)
								}
							>
								<h3 className="text-white text-sm font-medium mb-1 leading-tight">
									{news.title}
								</h3>
								<div className="text-xs text-gray-400">
									{news.time}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* My Watchlist - Right Column */}
				<div className="col-span-4 bg-black rounded-lg p-4 flex flex-col">
					<div className="flex items-center justify-between mb-3">
						<h2 className="text-white text-lg font-bold">
							My Watchlist
						</h2>
					</div>
					<div
						className="grid grid-cols-2 gap-3 overflow-y-auto pr-1"
						style={{ maxHeight: "calc(100% - 2rem)" }}
					>
						{tiles.slice(0, 6).map((t, idx) => (
							<StockTile
								key={`${t.symbol}-${idx}`}
								symbol={t.symbol}
								name={t.name}
								price={t.price}
								change={t.change}
								changePercent={t.changePercent}
								chartData={t.chartData}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
