"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TickerTape } from "@/components/ticker-tape";
import { getSignals, getLatestCandles } from "@/lib/api";
import { ExternalLink, X, Maximize2, Sun, Moon } from "lucide-react";

interface AISignal {
    id: string;
    symbol: string;
    action: "BUY" | "SELL" | "WAIT" | "HOLD";
    entryPrice: number;
    takeProfit: number;
    stopLoss: number;
    confidence: number;
    timestamp: string;
    status: "ACTIVE" | "COMPLETED" | "STOPPED" | "PENDING";
    pnl?: number;
    reason: string;
    timeframe: string;
    chartUrl: string;
}

const PRESET_SYMBOLS = [
    "BTCUSDT",
    "ETHUSDT",
    "EURUSD",
    "GBPUSD",
    "XAUUSD",
    "USDJPY",
];

export default function AIPage() {
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [signals, setSignals] = useState<AISignal[]>([]);
    const [lastUpdate, setLastUpdate] = useState(new Date());
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
        const load = async () => {
            try {
                const combined: AISignal[] = [];
                for (const sym of PRESET_SYMBOLS) {
                    try {
                        const [sigRows, lastCandles] = await Promise.all([
                            getSignals(sym, 20),
                            getLatestCandles(sym, 1),
                        ]);
                        const lastPx = lastCandles?.[0]?.close ?? 0;
                        for (const s of sigRows) {
                            const entry = lastPx || 0;
                            const action = (s.action || "wait").toUpperCase() as AISignal["action"];
                            combined.push({
                                id: String(s.id),
                                symbol: s.symbol,
                                action,
                                entryPrice: action === "WAIT" ? 0 : entry,
                                takeProfit: s.take_profit ?? 0,
                                stopLoss: s.stop_loss ?? 0,
                                confidence: s.confidence != null ? Math.round((s.confidence as number) * 100) : 0,
                                timestamp: s.created_at,
                                status: action === "WAIT" ? "PENDING" : "ACTIVE",
                                pnl: s.pnl ?? undefined,
                                reason: s.reason ?? "",
                                timeframe: "1M",
                                chartUrl: s.chart_screenshot ?? "",
                            });
                        }
                    } catch {
                        // ignore per-symbol errors
                    }
                }
                // Sort newest first like the table expects
                combined.sort((a, b) => (new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
                setSignals(combined);
                setLastUpdate(new Date());
            } catch {
                // leave empty if total failure
            }
        };
        load();
    }, []);

    const navigateToTab = (tab: string) => {
        router.push(`/${tab}`);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };
	return (
		<div
			className={`min-h-screen font-mono ${
				isDarkMode
					? "bg-[#121212] text-white"
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
					<span className="text-yellow-500 text-xs sm:text-sm">
						AI
					</span>
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

			{/* AI Dashboard Header */}
			<div
				className={`${
					isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
				} px-4 py-3 border-b ${
					isDarkMode ? "border-gray-700" : "border-gray-300"
				}`}
			>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-bold text-[#ff9800]">
							AI Trading Signals
						</h1>
						<p
							className={`text-sm ${
								isDarkMode
									? "text-gray-400"
									: "text-gray-600"
							}`}
						>
							Automated analysis updated every 10
							minutes
						</p>
					</div>
					<div className="flex items-center gap-4">
						<div className="text-center">
							<div className="text-lg font-bold text-[#ff9800]">
								{
									signals.filter(
										(s) =>
											s.status ===
											"ACTIVE"
									).length
								}
							</div>
							<div className="text-xs text-gray-500">
								Active
							</div>
						</div>
						<div className="text-center">
							<div className="text-lg font-bold text-[#ff9800]">
								{
									signals.filter(
										(s) =>
											s.status ===
											"COMPLETED"
									).length
								}
							</div>
							<div className="text-xs text-gray-500">
								Completed
							</div>
						</div>
						<div className="text-center">
							<div className="text-lg font-bold text-[#ff9800]">
								{
									signals.filter(
										(s) =>
											s.action ===
											"WAIT"
									).length
								}
							</div>
							<div className="text-xs text-gray-500">
								Waiting
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Signals Table */}
			<div className="p-4">
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
									className={`px-3 py-2 text-left border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									Signal ID
								</th>
								<th
									className={`px-3 py-2 text-left border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									Symbol
								</th>
								<th
									className={`px-3 py-2 text-center border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									Action
								</th>
								<th
									className={`px-3 py-2 text-right border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									Entry Price
								</th>
								<th
									className={`px-3 py-2 text-right border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									Take Profit
								</th>
								<th
									className={`px-3 py-2 text-right border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									Stop Loss
								</th>
								<th
									className={`px-3 py-2 text-center border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									Confidence
								</th>
								<th
									className={`px-3 py-2 text-right border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									P&L
								</th>
								<th
									className={`px-3 py-2 text-center border-r ${
										isDarkMode
											? "border-gray-600"
											: "border-gray-400"
									}`}
								>
									Chart Screenshot
								</th>
								<th
									className={`px-3 py-2 text-left`}
								>
									Reason
								</th>
							</tr>
						</thead>
						<tbody>
							{signals.map((signal, index) => (
								<tr
									key={signal.id}
									className={`border-b ${
										isDarkMode
											? "border-gray-800"
											: "border-gray-300"
									}`}
								>
									<td
										className={`px-3 py-2 border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										<span className="text-[#ff9800] font-mono text-sm">
											{signal.id}
										</span>
									</td>
									<td
										className={`px-3 py-2 border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										<div className="flex items-center gap-2">
											<span className="font-bold">
												{
													signal.symbol
												}
											</span>
											<span
												className={`text-xs px-1 py-0.5 rounded ${
													isDarkMode
														? "bg-gray-700"
														: "bg-gray-200"
												}`}
											>
												{
													signal.timeframe
												}
											</span>
										</div>
									</td>
									<td
										className={`px-3 py-2 text-center border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										<div className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-bold text-[#ff9800] bg-[#ff9800]/10 border border-[#ff9800]/20">
											{
												signal.action
											}
										</div>
									</td>
									<td
										className={`px-3 py-2 text-right font-mono border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										{signal.action ===
										"WAIT"
											? "-"
											: signal.entryPrice.toFixed(
													signal.symbol.includes(
														"JPY"
													)
														? 3
														: 4
											  )}
									</td>
									<td
										className={`px-3 py-2 text-right font-mono border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										{signal.action ===
										"WAIT"
											? "-"
											: signal.takeProfit.toFixed(
													signal.symbol.includes(
														"JPY"
													)
														? 3
														: 4
											  )}
									</td>
									<td
										className={`px-3 py-2 text-right font-mono border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										{signal.action ===
										"WAIT"
											? "-"
											: signal.stopLoss.toFixed(
													signal.symbol.includes(
														"JPY"
													)
														? 3
														: 4
											  )}
									</td>
									<td
										className={`px-3 py-2 text-center border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										<div className="inline-flex items-center gap-1 px-2 py-1 rounded text-sm text-[#ff9800] bg-[#ff9800]/10 border border-[#ff9800]/20">
											{
												signal.confidence
											}
											%
										</div>
									</td>
									<td
										className={`px-3 py-2 text-right font-mono border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										{signal.pnl !==
											undefined &&
										signal.entryPrice >
											0 ? (
											<span
												className={
													signal.pnl >=
													0
														? "text-green-500"
														: "text-red-500"
												}
											>
												{signal.pnl >=
												0
													? "+"
													: ""}
												{(
													(signal.pnl /
														signal.entryPrice) *
													100
												).toFixed(
													2
												)}
												%
											</span>
										) : (
											"-"
										)}
									</td>
									<td
										className={`px-3 py-2 text-center border-r ${
											isDarkMode
												? "border-gray-600"
												: "border-gray-400"
										}`}
									>
										<div className="flex items-center justify-center">
											<a
												href={
													signal.chartUrl
												}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs border hover:bg-opacity-80 bg-[#ff9800]/10 text-[#ff9800] border-[#ff9800]/20 hover:bg-[#ff9800]/20"
											>
												<ExternalLink className="h-3 w-3" />
												View
												Chart
											</a>
										</div>
									</td>
									<td
										className={`px-3 py-2 text-sm ${
											isDarkMode
												? "text-gray-300"
												: "text-gray-700"
										}`}
									>
										{signal.reason}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
