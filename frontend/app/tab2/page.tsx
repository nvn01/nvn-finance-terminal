"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TickerTape } from "@/components/ticker-tape";
import {
	X,
	Maximize2,
	Minus,
	Sun,
	Moon,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Clock,
	Database,
	RefreshCw,
	Server,
} from "lucide-react";

// Dummy data for MT4/MT5 and API monitoring (restored)
const dataSourcesStatus = [
  {
    id: "mt4_server_1",
    name: "MT4 Server 1",
    type: "MT4",
    status: "connected",
    lastUpdate: "2024-01-15 16:45:23",
    symbolsCount: 45,
    ticksPerSecond: 1250,
    latency: 12,
    uptime: "99.8%",
    errors: 0,
    dataGaps: 2,
  },
  {
    id: "mt4_server_2",
    name: "MT4 Server 2",
    type: "MT4",
    status: "warning",
    lastUpdate: "2024-01-15 16:44:58",
    symbolsCount: 38,
    ticksPerSecond: 890,
    latency: 45,
    uptime: "97.2%",
    errors: 3,
    dataGaps: 8,
  },
  {
    id: "mt5_server_1",
    name: "MT5 Server 1",
    type: "MT5",
    status: "connected",
    lastUpdate: "2024-01-15 16:45:25",
    symbolsCount: 67,
    ticksPerSecond: 1850,
    latency: 8,
    uptime: "99.9%",
    errors: 0,
    dataGaps: 0,
  },
  {
    id: "mt5_server_2",
    name: "MT5 Server 2",
    type: "MT5",
    status: "disconnected",
    lastUpdate: "2024-01-15 16:42:10",
    symbolsCount: 0,
    ticksPerSecond: 0,
    latency: 0,
    uptime: "0%",
    errors: 15,
    dataGaps: 45,
  },
  {
    id: "api_yahoo",
    name: "Yahoo Finance API",
    type: "API",
    status: "connected",
    lastUpdate: "2024-01-15 16:45:20",
    symbolsCount: 125,
    ticksPerSecond: 450,
    latency: 180,
    uptime: "98.5%",
    errors: 1,
    dataGaps: 5,
  },
  {
    id: "api_alpha",
    name: "Alpha Vantage API",
    type: "API",
    status: "warning",
    lastUpdate: "2024-01-15 16:43:45",
    symbolsCount: 89,
    ticksPerSecond: 120,
    latency: 350,
    uptime: "95.8%",
    errors: 7,
    dataGaps: 12,
  },
  {
    id: "api_polygon",
    name: "Polygon.io API",
    type: "API",
    status: "connected",
    lastUpdate: "2024-01-15 16:45:22",
    symbolsCount: 156,
    ticksPerSecond: 2100,
    latency: 25,
    uptime: "99.7%",
    errors: 0,
    dataGaps: 1,
  },
];

const recentErrors = [
  {
    id: 1,
    timestamp: "2024-01-15 16:42:10",
    source: "MT5 Server 2",
    type: "CONNECTION_LOST",
    message: "Connection timeout after 30 seconds",
    severity: "critical",
    resolved: false,
  },
  {
    id: 2,
    timestamp: "2024-01-15 16:38:45",
    source: "Alpha Vantage API",
    type: "RATE_LIMIT",
    message: "API rate limit exceeded (500 calls/minute)",
    severity: "warning",
    resolved: true,
  },
  {
    id: 3,
    timestamp: "2024-01-15 16:35:12",
    source: "MT4 Server 2",
    type: "DATA_GAP",
    message: "Missing tick data for EURUSD between 16:34:45 - 16:35:12",
    severity: "warning",
    resolved: true,
  },
  {
    id: 4,
    timestamp: "2024-01-15 16:30:33",
    source: "Yahoo Finance API",
    type: "INVALID_DATA",
    message: "Received invalid price data for AAPL",
    severity: "minor",
    resolved: true,
  },
];

const databaseStats = {
  totalRecords: 15847392,
  todayInserts: 284756,
  avgInsertRate: 1250,
  diskUsage: "2.4 TB",
  memoryUsage: "8.2 GB",
  cpuUsage: 23.5,
  activeConnections: 45,
  slowQueries: 3,
};

export default function Tab2Page() {
	const [isDarkMode, setIsDarkMode] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [autoRefresh, setAutoRefresh] = useState(true);
	const [selectedFilter, setSelectedFilter] = useState("all");
	const router = useRouter();

	useEffect(() => {
		const isAuthenticated = localStorage.getItem("isAuthenticated");
		if (!isAuthenticated) {
			router.push("/login");
		}

		document.body.classList.toggle("dark", isDarkMode);
		document.body.classList.toggle("light", !isDarkMode);
	}, [isDarkMode, router]);

	useEffect(() => {
		if (autoRefresh) {
			const interval = setInterval(() => {
				setRefreshing(true);
				setTimeout(() => setRefreshing(false), 1000);
			}, 10000); // Refresh every 10 seconds

			return () => clearInterval(interval);
		}
	}, [autoRefresh]);

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode);
	};

	const navigateToTab = (tab: string) => {
		router.push(`/${tab}`);
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "connected":
				return (
					<CheckCircle className="h-4 w-4 text-green-500" />
				);
			case "warning":
				return (
					<AlertTriangle className="h-4 w-4 text-yellow-500" />
				);
			case "disconnected":
				return <XCircle className="h-4 w-4 text-red-500" />;
			default:
				return <Clock className="h-4 w-4 text-gray-500" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "connected":
				return "text-green-500";
			case "warning":
				return "text-yellow-500";
			case "disconnected":
				return "text-red-500";
			default:
				return "text-gray-500";
		}
	};

	const getSeverityColor = (severity: string) => {
		switch (severity) {
			case "critical":
				return "text-red-500 bg-red-500/10";
			case "warning":
				return "text-yellow-500 bg-yellow-500/10";
			case "minor":
				return "text-blue-500 bg-blue-500/10";
			default:
				return "text-gray-500 bg-gray-500/10";
		}
	};

	const filteredSources = dataSourcesStatus.filter((source) => {
		if (selectedFilter === "all") return true;
		if (selectedFilter === "issues")
			return source.status !== "connected";
		return source.type.toLowerCase() === selectedFilter;
	});

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
					<span className="text-yellow-500 text-xs sm:text-sm">
						TAB 2
					</span>
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

			{/* Control Panel */}
			<div
				className={`${
					isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
				} px-4 py-3 border-b ${
					isDarkMode ? "border-gray-700" : "border-gray-300"
				}`}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<h1 className="text-lg font-bold text-[#ff9800]">
							Data Collection Monitor
						</h1>
						<div className="flex items-center gap-2">
							<button
								onClick={() =>
									setAutoRefresh(
										!autoRefresh
									)
								}
								className={`px-3 py-1 text-xs rounded ${
									autoRefresh
										? "bg-green-600 text-white"
										: "bg-gray-600 text-gray-300"
								}`}
							>
								{autoRefresh
									? "AUTO"
									: "MANUAL"}
							</button>
							<button
								onClick={() => {
									setRefreshing(true);
									setTimeout(
										() =>
											setRefreshing(
												false
											),
										1000
									);
								}}
								className={`px-3 py-1 text-xs rounded bg-[#ff9800] text-black hover:bg-[#e68900] ${
									refreshing
										? "animate-pulse"
										: ""
								}`}
							>
								<RefreshCw
									className={`h-3 w-3 inline mr-1 ${
										refreshing
											? "animate-spin"
											: ""
									}`}
								/>
								{refreshing
									? "REFRESHING..."
									: "REFRESH"}
							</button>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-center">
							<div className="text-lg font-bold text-green-500">
								{
									dataSourcesStatus.filter(
										(s) =>
											s.status ===
											"connected"
									).length
								}
							</div>
							<div className="text-xs text-gray-500">
								Connected
							</div>
						</div>
						<div className="text-center">
							<div className="text-lg font-bold text-yellow-500">
								{
									dataSourcesStatus.filter(
										(s) =>
											s.status ===
											"warning"
									).length
								}
							</div>
							<div className="text-xs text-gray-500">
								Warning
							</div>
						</div>
						<div className="text-center">
							<div className="text-lg font-bold text-red-500">
								{
									dataSourcesStatus.filter(
										(s) =>
											s.status ===
											"disconnected"
									).length
								}
							</div>
							<div className="text-xs text-gray-500">
								Offline
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Filter Bar */}
			<div
				className={`flex items-center gap-2 ${
					isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
				} px-4 py-2 text-[#ff9800] text-sm`}
			>
				<span className="font-bold">Filter:</span>
				{["all", "mt4", "mt5", "api", "issues"].map(
					(filter) => (
						<button
							key={filter}
							onClick={() =>
								setSelectedFilter(filter)
							}
							className={`px-3 py-1 rounded text-xs ${
								selectedFilter === filter
									? "bg-[#ff9800] text-black"
									: `${
											isDarkMode
												? "bg-gray-700 hover:bg-gray-600"
												: "bg-gray-300 hover:bg-gray-200"
									  } text-gray-300 hover:text-white`
							}`}
						>
							{filter.toUpperCase()}
						</button>
					)
				)}
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-12 gap-4 p-4">
				{/* Data Sources Status - Left Column */}
				<div className="col-span-8">
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
							<h3 className="font-bold text-[#ff9800]">
								Data Sources Status
							</h3>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr
										className={`${
											isDarkMode
												? "bg-[#2a2a2a]"
												: "bg-[#f5f5f5]"
										} text-xs`}
									>
										<th className="px-3 py-2 text-left">
											Source
										</th>
										<th className="px-3 py-2 text-center">
											Status
										</th>
										<th className="px-3 py-2 text-center">
											Type
										</th>
										<th className="px-3 py-2 text-right">
											Symbols
										</th>
										<th className="px-3 py-2 text-right">
											Ticks/sec
										</th>
										<th className="px-3 py-2 text-right">
											Latency
										</th>
										<th className="px-3 py-2 text-right">
											Uptime
										</th>
										<th className="px-3 py-2 text-right">
											Errors
										</th>
										<th className="px-3 py-2 text-left">
											Last Update
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredSources.map(
										(source) => (
											<tr
												key={
													source.id
												}
												className={`border-b ${
													isDarkMode
														? "border-gray-700"
														: "border-gray-200"
												} hover:${
													isDarkMode
														? "bg-[#2a2a2a]"
														: "bg-gray-50"
												}`}
											>
												<td className="px-3 py-2">
													<div className="flex items-center gap-2">
														<span className="font-medium">
															{
																source.name
															}
														</span>
													</div>
												</td>
												<td className="px-3 py-2 text-center">
													<div className="flex items-center justify-center gap-1">
														{getStatusIcon(
															source.status
														)}
														<span
															className={`text-xs ${getStatusColor(
																source.status
															)}`}
														>
															{source.status.toUpperCase()}
														</span>
													</div>
												</td>
												<td className="px-3 py-2 text-center">
													<span className="text-xs">
														{
															source.type
														}
													</span>
												</td>
												<td className="px-3 py-2 text-right font-mono text-sm">
													{
														source.symbolsCount
													}
												</td>
												<td className="px-3 py-2 text-right font-mono text-sm">
													{source.ticksPerSecond.toLocaleString()}
												</td>
												<td className="px-3 py-2 text-right font-mono text-sm">
													<span
														className={
															source.latency >
															100
																? "text-red-500"
																: source.latency >
																  50
																? "text-yellow-500"
																: "text-[#ff9800]"
														}
													>
														{
															source.latency
														}
														ms
													</span>
												</td>
												<td className="px-3 py-2 text-right font-mono text-sm">
													<span className="text-xs">
														{
															source.uptime
														}
													</span>
												</td>
												<td className="px-3 py-2 text-right font-mono text-sm">
													<span className="text-xs">
														{
															source.errors
														}
													</span>
												</td>
												<td className="px-3 py-2 text-xs text-gray-400 font-mono">
													{
														source.lastUpdate
													}
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>
					</div>
				</div>

				{/* Right Column - Database Stats & Recent Errors */}
				<div className="col-span-4 space-y-4">
					{/* Database Statistics */}
					<div
						className={`${
							isDarkMode
								? "bg-[#1a1a1a] border-gray-700"
								: "bg-white border-gray-300"
						} border rounded-lg`}
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
							<h3 className="font-bold text-[#ff9800]">
								Database Statistics
							</h3>
						</div>
						<div className="p-4 space-y-3">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<div className="text-xs text-gray-400">
										Total Records
									</div>
									<div className="text-lg font-bold text-[#ff9800]">
										{databaseStats.totalRecords.toLocaleString()}
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-400">
										Today's Inserts
									</div>
									<div className="text-lg font-bold text-green-500">
										{databaseStats.todayInserts.toLocaleString()}
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-400">
										Insert Rate
									</div>
									<div className="text-sm font-mono">
										{
											databaseStats.avgInsertRate
										}
										/sec
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-400">
										Disk Usage
									</div>
									<div className="text-sm font-mono">
										{
											databaseStats.diskUsage
										}
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-400">
										Memory Usage
									</div>
									<div className="text-sm font-mono">
										{
											databaseStats.memoryUsage
										}
									</div>
								</div>
								<div>
									<div className="text-xs text-gray-400">
										CPU Usage
									</div>
									<div className="text-sm font-mono">
										{
											databaseStats.cpuUsage
										}
										%
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Recent Errors */}
					<div
						className={`${
							isDarkMode
								? "bg-[#1a1a1a] border-gray-700"
								: "bg-white border-gray-300"
						} border rounded-lg`}
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
							<h3 className="font-bold text-[#ff9800]">
								Recent Errors
							</h3>
						</div>
						<div className="max-h-64 overflow-y-auto">
							{recentErrors.map((error) => (
								<div
									key={error.id}
									className={`p-3 border-b ${
										isDarkMode
											? "border-gray-700"
											: "border-gray-200"
									} last:border-b-0`}
								>
									<div className="flex items-start justify-between mb-1">
										<span
											className={`px-2 py-1 rounded text-xs ${getSeverityColor(
												error.severity
											)}`}
										>
											{error.severity.toUpperCase()}
										</span>
										<span className="text-xs text-gray-400 font-mono">
											{
												error.timestamp
											}
										</span>
									</div>
									<div className="text-sm font-medium mb-1">
										{error.source}
									</div>
									<div className="text-xs text-gray-300 mb-1">
										{error.type}
									</div>
									<div className="text-xs text-gray-400">
										{error.message}
									</div>
									{error.resolved && (
										<div className="text-xs text-green-500 mt-1">
											✓ Resolved
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
