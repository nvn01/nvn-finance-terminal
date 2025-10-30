"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	ChevronDown,
	X,
	Maximize2,
	MessageSquare,
	Star,
	Bell,
	HelpCircle,
	ChevronLeft,
	ChevronRight,
	Sun,
	Moon,
	Activity,
} from "lucide-react";
import { TickerTape } from "@/components/ticker-tape";
import { RealTimeChart } from "@/components/real-time-chart";
import { getLatestCandles } from "@/lib/api";
import { symbols } from "@/lib/symbols";

const fixedColumnClass =
	"w-[120px] sm:w-[140px] whitespace-nowrap overflow-hidden text-ellipsis";

export default function ForexPage() {
	const [isDarkMode, setIsDarkMode] = useState(true);
	const router = useRouter();
	const [timeframeDropdown, setTimeframeDropdown] = useState(false);
	const [ytdDropdown, setYtdDropdown] = useState(false);
	const [currencyDropdown, setCurrencyDropdown] = useState(false);
	const [selectedTimeframe, setSelectedTimeframe] = useState("10D");
	const [selectedYtd, setSelectedYtd] = useState("%Chg YTD");
	const [selectedCurrency, setSelectedCurrency] = useState("USD");
	const [showQuickActions, setShowQuickActions] = useState(false);
	const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
	const makeItem = (id: string) => ({
		id,
		num: "",
		rmi: "",
		value: 0,
		change: 0,
		pctChange: 0,
		avat: 0,
		time: "",
		ytd: 0,
		ytdCur: 0,
	});
	const [dataState, setDataState] = useState({
		major: symbols.forex.major.map(makeItem),
		emerging: symbols.forex.emerging.map(makeItem),
	});

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

	const toggleMarketSelection = (marketId: string) => {
		setSelectedMarkets((prev) =>
			prev.includes(marketId)
				? prev.filter((id) => id !== marketId)
				: [...prev, marketId]
		);
	};

	const renderSection = (
		title: string,
		items: any[],
		sectionNum: string
	) => (
		<>
			<tr
				className={`${
					isDarkMode
						? "text-white bg-[#1a1a1a]"
						: "text-black bg-[#e6e6e6]"
				}`}
			>
				<th
					className={`sticky left-0 ${
						isDarkMode
							? "bg-[#1a1a1a]"
							: "bg-[#e6e6e6]"
					} px-2 py-1 text-left ${fixedColumnClass} border-r ${
						isDarkMode
							? "border-gray-600"
							: "border-gray-400"
					}`}
				>
					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							className="h-3 w-3 accent-[#ff9800]"
							onChange={(e) => {
								if (e.target.checked) {
									items.forEach((item) =>
										toggleMarketSelection(
											item.id
										)
									);
								} else {
									items.forEach((item) => {
										if (
											selectedMarkets.includes(
												item.id
											)
										) {
											toggleMarketSelection(
												item.id
											);
										}
									});
								}
							}}
						/>
						{sectionNum} {title}
					</div>
				</th>
				<th colSpan={9}></th>
			</tr>
			{items.map((item) => (
				<tr
					key={item.id}
					className={`border-b ${
						isDarkMode
							? "border-gray-800"
							: "border-gray-300"
					} ${
						selectedMarkets.includes(item.id)
							? isDarkMode
								? "bg-[#2a2a2a]"
								: "bg-blue-50"
							: ""
					}`}
				>
					<td
						className={`sticky left-0 ${
							isDarkMode
								? "bg-[#121212]"
								: "bg-[#f0f0f0]"
						} px-2 py-1 ${fixedColumnClass} border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								className="h-3 w-3 accent-[#ff9800]"
								checked={selectedMarkets.includes(
									item.id
								)}
								onChange={() =>
									toggleMarketSelection(
										item.id
									)
								}
							/>
							<span
								className={`${
									isDarkMode
										? "text-gray-500"
										: "text-gray-600"
								} text-xs`}
							>
								{item.num}
							</span>
							<button
								onClick={() => {
									const symbolSlug = item.id
										.toLowerCase()
										.replace(
											/[^a-z0-9]/g,
											""
										);
									router.push(
										`/forex/${symbolSlug}`
									);
								}}
								className="text-[#ff9800] text-xs hover:underline text-left"
							>
								{item.id}
							</button>
						</div>
					</td>
					<td
						className={`px-2 py-1 w-[100px] ${
							isDarkMode
								? "bg-[#121212]"
								: "bg-[#f0f0f0]"
						} border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						<div className="flex justify-center">
							<RealTimeChart
								data={item}
								width={80}
								height={20}
								isDarkMode={isDarkMode}
							/>
						</div>
					</td>
					<td
						className={`px-2 py-1 text-right ${
							isDarkMode
								? "text-yellow-100"
								: "text-yellow-800"
						} text-xs border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						{item.value.toFixed(4)}
					</td>
					<td
						className={`px-2 py-1 text-right text-xs border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						<span
							className={
								item.change > 0
									? "text-green-500"
									: "text-red-500"
							}
						>
							{item.change > 0 ? "+" : ""}
							{item.change.toFixed(4)}
						</span>
					</td>
					<td
						className={`px-2 py-1 text-right text-xs border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						<span
							className={
								item.pctChange > 0
									? "text-green-500"
									: "text-red-500"
							}
						>
							{item.pctChange > 0 ? "+" : ""}
							{item.pctChange.toFixed(2)}%
						</span>
					</td>
					<td
						className={`px-2 py-1 text-right text-xs hidden sm:table-cell border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						<span
							className={
								item.avat > 0
									? "text-green-500"
									: "text-red-500"
							}
						>
							{item.avat.toFixed(2)}%
						</span>
					</td>
					<td
						className={`px-2 py-1 text-right ${
							isDarkMode
								? "text-yellow-100"
								: "text-yellow-800"
						} text-xs hidden sm:table-cell border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						{item.time}
					</td>
					<td
						className={`px-2 py-1 text-right text-xs hidden md:table-cell border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						<span
							className={
								isDarkMode
									? "text-yellow-100"
									: "text-yellow-800"
							}
						>
							N/A
						</span>
					</td>
					<td
						className={`px-2 py-1 text-right text-xs hidden md:table-cell border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						<span
							className={
								item.ytd > 0
									? "text-green-500"
									: "text-red-500"
							}
						>
							{item.ytd > 0 ? "+" : ""}
							{item.ytd.toFixed(2)}%
						</span>
					</td>
					<td
						className={`px-2 py-1 text-right text-xs hidden md:table-cell`}
					>
						<span
							className={
								item.ytdCur > 0
									? "text-green-500"
									: "text-red-500"
							}
						>
							{item.ytdCur > 0 ? "+" : ""}
							{item.ytdCur.toFixed(2)}%
						</span>
					</td>
				</tr>
			))}
		</>
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (timeframeDropdown || ytdDropdown || currencyDropdown) {
				setTimeframeDropdown(false);
				setYtdDropdown(false);
				setCurrencyDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [timeframeDropdown, ytdDropdown, currencyDropdown]);

	// Load latest price metrics from API and hydrate values
	useEffect(() => {
		const updateSection = async (items: any[]) => {
			const updated = await Promise.all(
				items.map(async (it) => {
					const symbol = it.id;
					try {
						const latest = await getLatestCandles(symbol, 2);
						const last = latest[latest.length - 1];
						const prev = latest.length > 1 ? latest[latest.length - 2] : last;
						const price = last?.close ?? 0;
						const change = price - (prev?.close ?? price);
						const pctChange = (prev?.close ?? 0) !== 0 ? (change / (prev?.close as number)) * 100 : 0;
						const time = last?.ts ? new Date(last.ts).toLocaleTimeString() : it.time;
						return { ...it, value: price, change, pctChange, time };
					} catch {
						return it;
					}
				})
			);
			return updated;
		};

		const load = async () => {
			const major = await updateSection(dataState.major);
			const emerging = await updateSection(dataState.emerging);
			setDataState({ major, emerging });
		};

		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			className={`min-h-screen font-mono ${
				isDarkMode
					? "bg-[#121212] text-white"
					: "bg-[#f0f0f0] text-black"
			}`}
		>
			{/* Bloomberg Header */}
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
						onClick={() => navigateToTab("standard")}
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
					>
						STANDARD
					</button>
					<span className="text-yellow-500 text-xs sm:text-sm">
						FOREX
					</span>
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
				</div>
			</div>

			{/* Ticker Tape */}
			<TickerTape />

			{/* Navigation Bar */}
			<div
				className={`flex items-center gap-2 border-b ${
					isDarkMode
						? "border-gray-700 bg-[#1a1a1a]"
						: "border-gray-300 bg-[#e6e6e6]"
				} px-2 py-1 text-xs sm:text-sm`}
			>
				<button
					onClick={() => router.back()}
					className="flex items-center gap-1 hover:text-[#ff9800] transition-colors"
				>
					<ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
				</button>
				<button className="flex items-center gap-1 hover:text-[#ff9800] transition-colors">
					<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
				</button>
				<button className="flex items-center gap-1 hover:text-[#ff9800] transition-colors">
					<span>Forex Overview</span>
					<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				</button>
				<span
					className={
						isDarkMode
							? "text-gray-400"
							: "text-gray-600"
					}
				>
					|
				</span>
				<button className="flex items-center gap-1 hover:text-[#ff9800] transition-colors">
					<span>FX</span>
					<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				</button>
				<button className="flex items-center gap-1 hover:text-[#ff9800] transition-colors">
					<span className="hidden sm:inline">
						Currency Functions
					</span>
					<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				</button>
				<div className="ml-auto flex items-center gap-2">
					<button className="hover:text-[#ff9800] transition-colors">
						<MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
					<span className="hidden sm:inline">Message</span>
					<button className="hover:text-[#ff9800] transition-colors">
						<Star className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
					<button className="hover:text-[#ff9800] transition-colors">
						<Bell className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
					<button className="hover:text-[#ff9800] transition-colors">
						<HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
				</div>
			</div>

			{/* Filter Bar */}
			<div
				className={`flex flex-wrap items-center gap-2 ${
					isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
				} px-2 py-1 text-[#ff9800] text-xs sm:text-sm`}
			>
				<span className="font-bold">Forex Markets</span>

				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
					/>
					<span>Majors</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
					/>
					<span>Minors</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
					/>
					<span>Exotics</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
					/>
					<span>Commodities</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
						defaultChecked
					/>
					<span>Δ AVAT</span>
				</label>

				{/* Timeframe Dropdown */}
				<div className="relative">
					<button
						onClick={() =>
							setTimeframeDropdown(
								!timeframeDropdown
							)
						}
						className="flex items-center gap-2"
					>
						<span className="bg-[#ff9800] px-2 py-0.5 text-black">
							{selectedTimeframe}
						</span>
						<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
					{timeframeDropdown && (
						<div
							className={`absolute top-full left-0 mt-1 ${
								isDarkMode
									? "bg-[#2a2a2a] border-gray-600"
									: "bg-white border-gray-300"
							} border rounded shadow-lg z-10 min-w-[80px]`}
						>
							{[
								"1D",
								"5D",
								"10D",
								"1M",
								"3M",
								"6M",
								"1Y",
							].map((timeframe) => (
								<button
									key={timeframe}
									onClick={() => {
										setSelectedTimeframe(
											timeframe
										);
										setTimeframeDropdown(
											false
										);
									}}
									className={`block w-full text-left px-3 py-2 text-sm hover:${
										isDarkMode
											? "bg-[#3a3a3a]"
											: "bg-gray-100"
									} ${
										selectedTimeframe ===
										timeframe
											? "font-bold"
											: ""
									}`}
								>
									{timeframe}
								</button>
							))}
						</div>
					)}
				</div>

				{/* YTD Dropdown */}
				<div className="relative">
					<button
						onClick={() => setYtdDropdown(!ytdDropdown)}
						className="flex items-center gap-2"
					>
						<span className="bg-[#ff9800] px-2 py-0.5 text-black">
							{selectedYtd}
						</span>
						<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
					{ytdDropdown && (
						<div
							className={`absolute top-full left-0 mt-1 ${
								isDarkMode
									? "bg-[#2a2a2a] border-gray-600"
									: "bg-white border-gray-300"
							} border rounded shadow-lg z-10 min-w-[120px]`}
						>
							{[
								"%Chg YTD",
								"%Chg 1Y",
								"%Chg 3Y",
								"%Chg 5Y",
								"Total Return",
							].map((ytd) => (
								<button
									key={ytd}
									onClick={() => {
										setSelectedYtd(ytd);
										setYtdDropdown(
											false
										);
									}}
									className={`block w-full text-left px-3 py-2 text-sm hover:${
										isDarkMode
											? "bg-[#3a3a3a]"
											: "bg-gray-100"
									} ${
										selectedYtd === ytd
											? "font-bold"
											: ""
									}`}
								>
									{ytd}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Currency Dropdown */}
				<div className="relative">
					<button
						onClick={() =>
							setCurrencyDropdown(!currencyDropdown)
						}
						className="flex items-center gap-2"
					>
						<span className="bg-[#ff9800] px-2 py-0.5 text-black">
							{selectedCurrency}
						</span>
						<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
					</button>
					{currencyDropdown && (
						<div
							className={`absolute top-full left-0 mt-1 ${
								isDarkMode
									? "bg-[#2a2a2a] border-gray-600"
									: "bg-white border-gray-300"
							} border rounded shadow-lg z-10 min-w-[80px]`}
						>
							{[
								"USD",
								"EUR",
								"GBP",
								"JPY",
								"CAD",
								"AUD",
								"CHF",
							].map((currency) => (
								<button
									key={currency}
									onClick={() => {
										setSelectedCurrency(
											currency
										);
										setCurrencyDropdown(
											false
										);
									}}
									className={`block w-full text-left px-3 py-2 text-sm hover:${
										isDarkMode
											? "bg-[#3a3a3a]"
											: "bg-gray-100"
									} ${
										selectedCurrency ===
										currency
											? "font-bold"
											: ""
									}`}
								>
									{currency}
								</button>
							))}
						</div>
					)}
				</div>
			</div>

			{selectedMarkets.length > 0 && (
				<div
					className={`${
						isDarkMode ? "bg-[#2a2a2a]" : "bg-blue-100"
					} px-4 py-2 border-b ${
						isDarkMode
							? "border-gray-700"
							: "border-gray-300"
					} flex items-center justify-between`}
				>
					<div className="flex items-center gap-4">
						<span className="text-sm font-medium">
							{selectedMarkets.length} pairs
							selected
						</span>
						<button className="bg-[#ff9800] hover:bg-[#e68900] px-3 py-1 text-black text-sm rounded transition-colors">
							Add to Watchlist
						</button>
						<button className="bg-green-600 hover:bg-green-700 px-3 py-1 text-white text-sm rounded transition-colors">
							Set Alerts
						</button>
						<button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 text-white text-sm rounded transition-colors">
							Compare
						</button>
					</div>
					<button
						onClick={() => setSelectedMarkets([])}
						className="text-gray-500 hover:text-red-500 text-sm"
					>
						Clear Selection
					</button>
				</div>
			)}

			{/* Main Content */}
			<div className="overflow-x-auto">
				<table className="w-full border-separate border-spacing-0">
					<thead>
						<tr
							className={`${
								isDarkMode
									? "text-white bg-[#1a1a1a]"
									: "text-black bg-[#e6e6e6]"
							}`}
						>
							<th
								className={`sticky left-0 ${
									isDarkMode
										? "bg-[#1a1a1a]"
										: "bg-[#e6e6e6]"
								} px-2 py-1 text-left ${fixedColumnClass} border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								Currency Pair
							</th>
							<th
								className={`px-2 py-1 text-center ${
									isDarkMode
										? "bg-[#1a1a1a]"
										: "bg-[#e6e6e6]"
								} border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								2 Day
							</th>
							<th
								className={`px-2 py-1 text-right border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								Rate
							</th>
							<th
								className={`px-2 py-1 text-right border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								Net Chg
							</th>
							<th
								className={`px-2 py-1 text-right border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								%Chg
							</th>
							<th
								className={`px-2 py-1 text-right hidden sm:table-cell border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								Δ AVAT
							</th>
							<th
								className={`px-2 py-1 text-right hidden sm:table-cell border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								Time
							</th>
							<th
								className={`px-2 py-1 text-right hidden md:table-cell border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								Spread
							</th>
							<th
								className={`px-2 py-1 text-right hidden md:table-cell border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								%YTD
							</th>
							<th
								className={`px-2 py-1 text-right hidden md:table-cell`}
							>
								%YTDCur
							</th>
						</tr>
					</thead>

					<tbody>
						{renderSection(
							"Major",
							dataState.major,
							"1)"
						)}
						{renderSection(
							"emerging currencies",
							dataState.emerging,
							"2)"
						)}
					</tbody>
				</table>
			</div>

			<button
				onClick={() => setShowQuickActions(!showQuickActions)}
				className="fixed bottom-6 right-6 bg-[#ff9800] hover:bg-[#e68900] text-black p-3 rounded-full shadow-lg transition-colors z-40"
			>
				<Activity className="h-6 w-6" />
			</button>

			{showQuickActions && (
				<div className="fixed bottom-20 right-6 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg z-50 p-4 w-48">
					<div className="space-y-2">
						<button className="w-full text-left text-sm hover:text-[#ff9800] py-1">
							Currency Converter
						</button>
						<button className="w-full text-left text-sm hover:text-[#ff9800] py-1">
							Economic Calendar
						</button>
						<button className="w-full text-left text-sm hover:text-[#ff9800] py-1">
							Central Bank Rates
						</button>
						<button className="w-full text-left text-sm hover:text-[#ff9800] py-1">
							FX Volatility
						</button>
						<hr className="border-gray-600" />
						<button className="w-full text-left text-sm hover:text-[#ff9800] py-1">
							Export Data
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
