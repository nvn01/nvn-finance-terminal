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
import { MarketTable } from "@/components/market-table";
import { useHydrateSection } from "@/lib/hooks";
import { symbols } from "@/lib/symbols";

export default function IndicesPage() {
	const [isDarkMode, setIsDarkMode] = useState(true);
	const router = useRouter();
	const [marketType, setMarketType] = useState<
		"standard" | "forex" | "crypto"
	>("standard");
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [timeframeDropdown, setTimeframeDropdown] = useState(false);
	const [ytdDropdown, setYtdDropdown] = useState(false);
	const [currencyDropdown, setCurrencyDropdown] = useState(false);
	const [selectedTimeframe, setSelectedTimeframe] = useState("10D");
	const [selectedYtd, setSelectedYtd] = useState("%Chg YTD");
	const [selectedCurrency, setSelectedCurrency] = useState("CAD");
	const [showQuickActions, setShowQuickActions] = useState(false);
	const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
	const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
	const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);

	const makeItem = (id: string) => ({
		id,
		num: "",
		rmi: "",
		value: 0,
		change: 0,
		pctChange: 0,
		avat: 0,
		time: "",
		advDcl: undefined as string | undefined,
		ytd: 0,
		ytdCur: 0,
	});

	const [allMarketData, setAllMarketData] = useState({
		standard: {
			americas: symbols.standard.americas.map(makeItem),
			emea: symbols.standard.emea.map(makeItem),
			asiaPacific: symbols.standard.asiaPacific.map(makeItem),
		},
		forex: {
			major: symbols.forex.major.map(makeItem),
			emerging: symbols.forex.emerging.map(makeItem),
		},
		crypto: {
			major: symbols.crypto.major.map(makeItem),
			altcoins: symbols.crypto.altcoins.map(makeItem),
		},
	});

	useEffect(() => {
		const isAuthenticated = localStorage.getItem("isAuthenticated");
		if (!isAuthenticated) {
			router.push("/login");
		}

		document.body.classList.toggle("dark", isDarkMode);
		document.body.classList.toggle("light", !isDarkMode);
	}, [isDarkMode, router]);

	// Hydrate via SWR hooks
	const stdAmer = useHydrateSection(allMarketData.standard.americas).data;
	const stdEmea = useHydrateSection(allMarketData.standard.emea).data;
	const stdAsia = useHydrateSection(allMarketData.standard.asiaPacific).data;
	const fxMajor = useHydrateSection(allMarketData.forex.major).data;
	const fxEmerg = useHydrateSection(allMarketData.forex.emerging).data;
	const cMajor = useHydrateSection(allMarketData.crypto.major).data;
	const cAlt = useHydrateSection(allMarketData.crypto.altcoins).data;

	const hydratedAll = {
		standard: { americas: stdAmer, emea: stdEmea, asiaPacific: stdAsia },
		forex: { major: fxMajor, emerging: fxEmerg },
		crypto: { major: cMajor, altcoins: cAlt },
	};

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

	const handleMarketTypeChange = (
		newMarketType: "standard" | "forex" | "crypto"
	) => {
		setMarketType(newMarketType);
		setSelectedMarkets([]);
		setIsDropdownOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				isDropdownOpen ||
				timeframeDropdown ||
				ytdDropdown ||
				currencyDropdown
			) {
				setIsDropdownOpen(false);
				setTimeframeDropdown(false);
				setYtdDropdown(false);
				setCurrencyDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isDropdownOpen, timeframeDropdown, ytdDropdown, currencyDropdown]);

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
					<span className="text-yellow-500 text-xs sm:text-sm">
						INDICES
					</span>
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
						className={`${
							isDarkMode
								? "text-gray-400 hover:text-white"
								: "text-gray-600 hover:text-black"
						} text-xs sm:text-sm`}
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
					<button
						onClick={() => setIsDarkMode(!isDarkMode)}
						className="ml-2"
					>
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
					onClick={() => router.back()}
					className="flex items-center gap-1 hover:text-[#ff9800] transition-colors"
				>
					<ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
				</button>
				<button
					onClick={() => {
						if (
							currentHistoryIndex <
							navigationHistory.length - 1
						) {
							const nextIndex =
								currentHistoryIndex + 1;
							setCurrentHistoryIndex(nextIndex);
							router.push(
								navigationHistory[nextIndex]
							);
						}
					}}
					className="flex items-center gap-1 hover:text-[#ff9800] transition-colors disabled:opacity-50"
					disabled={
						currentHistoryIndex >=
						navigationHistory.length - 1
					}
				>
					<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
				</button>
				<button
					onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					className="flex items-center gap-1 hover:text-[#ff9800] transition-colors"
				>
					<span>Market Overview</span>
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
					<span>WEI</span>
					<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				</button>
				<button className="flex items-center gap-1 hover:text-[#ff9800] transition-colors">
					<span className="hidden sm:inline">
						Related Functions Menu
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

			<div
				className={`flex flex-wrap items-center gap-2 ${
					isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
				} px-2 py-1 text-[#ff9800] text-xs sm:text-sm`}
			>
				<div className="relative">
					<span className="font-bold">
						Indices Markets
					</span>
				</div>

				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
					/>
					<span>Movers</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
					/>
					<span>Volatility</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
					/>
					<span>Ratios</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
					/>
					<span>Futures</span>
				</label>
				<label className="flex items-center gap-1">
					<input
						type="checkbox"
						className="h-3 w-3 accent-gray-500"
						defaultChecked
					/>
					<span>Δ AVAT</span>
				</label>

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
							{selectedMarkets.length} markets
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

			<MarketTable
				marketType={marketType}
				isDarkMode={isDarkMode}
				selectedMarkets={selectedMarkets}
				onToggleMarketSelection={toggleMarketSelection}
				marketData={hydratedAll}
			/>

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
							Market Screener
						</button>
						<button className="w-full text-left text-sm hover:text-[#ff9800] py-1">
							Economic Calendar
						</button>
						<button className="w-full text-left text-sm hover:text-[#ff9800] py-1">
							Portfolio Analysis
						</button>
						<button className="w-full text-left text-sm hover:text-[#ff9800] py-1">
							Risk Monitor
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
