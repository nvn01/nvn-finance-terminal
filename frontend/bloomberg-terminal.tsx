"use client";

import { useState, useEffect } from "react";
import {
	ChevronDown,
	X,
	Maximize2,
	Minus,
	MessageSquare,
	Star,
	Bell,
	HelpCircle,
	ChevronLeftIcon,
	ChevronRight,
	Sun,
	Moon,
} from "lucide-react";
import { Sparkline } from "./sparkline";
import { marketData } from "./marketData";

const fixedColumnClass =
	"w-[120px] sm:w-[140px] whitespace-nowrap overflow-hidden text-ellipsis";

export default function BloombergTerminal() {
	const [data, setData] = useState(marketData);
	const [isDarkMode, setIsDarkMode] = useState(true);

	useEffect(() => {
		document.body.classList.toggle("dark", isDarkMode);
		document.body.classList.toggle("light", !isDarkMode);
	}, [isDarkMode]);

	const toggleTheme = () => {
		setIsDarkMode(!isDarkMode);
	};

	const renderSection = (
		title: string,
		items: any[],
		sectionNum: string,
		isDarkMode: boolean
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
						isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
					} px-2 py-1 text-left ${fixedColumnClass} border-r ${
						isDarkMode
							? "border-gray-600"
							: "border-gray-400"
					}`}
				>
					{sectionNum} {title}
				</th>
				<th colSpan={9}></th>
			</tr>
			{items.map((item, index) => (
				<tr
					key={item.id}
					className={`border-b ${
						isDarkMode
							? "border-terminal-gray-800"
							: "border-gray-300"
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
							<span
								className={`${
									isDarkMode
										? "text-gray-500"
										: "text-gray-600"
								} text-xs`}
							>
								{item.num}
							</span>
							<span className="text-[#ff9800] text-xs">
								{item.id}
							</span>
						</div>
					</td>
					<td
						className={`px-2 py-1 text-center ${
							isDarkMode
								? "text-gray-400"
								: "text-gray-600"
						} text-xs border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						[□]
					</td>
					<td
						className={`px-2 py-1 w-[100px] ${
							isDarkMode
								? "bg-[#1a1a1a]"
								: "bg-[#e6e6e6]"
						} border-r ${
							isDarkMode
								? "border-gray-600"
								: "border-gray-400"
						}`}
					>
						<div className="flex justify-center">
							<Sparkline
								data1={[
									0.5, 0.6, 0.4, 0.7, 0.5,
									0.8, 0.6, 0.7,
								]}
								data2={[
									0.7, 0.5, 0.8, 0.6, 0.9,
									0.7, 1.0, 0.8,
								]}
								width={80}
								height={20}
								color1={
									isDarkMode
										? "#666666"
										: "#999999"
								}
								color2={
									item.change > 0
										? "#4CAF50"
										: "#EF4444"
								}
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
						{item.value.toLocaleString("en-US", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
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
							{item.change.toFixed(2)}
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
							{item.advDcl}
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
					isDarkMode
						? "border-terminal-gray-800"
						: "border-gray-300"
				}`}
			>
				<div className="flex items-center gap-4">
					<span
						className={`${
							isDarkMode
								? "text-gray-400"
								: "text-gray-600"
						} text-xs sm:text-sm`}
					>
						HOME{" "}
					</span>
					<span className="text-yellow-500 text-xs sm:text-sm">
						STANDARD{" "}
					</span>
					<span
						className={`${
							isDarkMode
								? "text-gray-400"
								: "text-gray-600"
						} text-xs sm:text-sm`}
					>
						TAB 2{" "}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="bg-yellow-500 px-2 py-0.5 text-black hidden sm:inline-block sm:text-sm">
						Tabs are here
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

			{/* Function Buttons */}
			<div
				className={`flex flex-wrap gap-1 ${
					isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
				} px-2 py-1 text-xs sm:text-sm`}
			>
				<button className="bg-red-600 px-2 py-0.5 text-white">
					CANCL
				</button>
			</div>

			{/* Navigation Bar */}
			<div
				className={`flex items-center gap-2 border-b ${
					isDarkMode
						? "border-terminal-gray-700 bg-[#1a1a1a]"
						: "border-gray-300 bg-[#e6e6e6]"
				} px-2 py-1 text-xs sm:text-sm`}
			>
				<ChevronLeftIcon className="h-3 w-3 sm:h-4 sm:w-4" />
				<ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
				<span>No Security Loaded</span>
				<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				<span
					className={
						isDarkMode
							? "text-gray-400"
							: "text-gray-600"
					}
				>
					|
				</span>
				<span>WEI</span>
				<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				<span className="hidden sm:inline">
					Related Functions Menu
				</span>
				<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				<div className="ml-auto flex items-center gap-2">
					<MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
					<span className="hidden sm:inline">Message</span>
					<Star className="h-3 w-3 sm:h-4 sm:w-4" />
					<Bell className="h-3 w-3 sm:h-4 sm:w-4" />
					<HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
				</div>
			</div>

			{/* Filter Bar */}
			<div
				className={`flex flex-wrap items-center gap-2 ${
					isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
				} px-2 py-1 text-[#ff9800] text-xs sm:text-sm`}
			>
				<div className="flex items-center gap-2">
					<span className="font-bold">Standard</span>
					<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
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
				<div className="flex items-center gap-2">
					<span className="bg-[#ff9800] px-2 py-0.5 text-black">
						10D
					</span>
					<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				</div>
				<div className="flex items-center gap-2">
					<span className="bg-[#ff9800] px-2 py-0.5 text-black">
						%Chg YTD
					</span>
					<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				</div>
				<div className="flex items-center gap-2">
					<span className="bg-[#ff9800] px-2 py-0.5 text-black">
						CAD
					</span>
					<ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
				</div>
			</div>

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
								Market
							</th>
							<th
								className={`px-2 py-1 text-center border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								RMI
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
								2Day
							</th>
							<th
								className={`px-2 py-1 text-right border-r ${
									isDarkMode
										? "border-gray-600"
										: "border-gray-400"
								}`}
							>
								Value
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
								%Ytd
							</th>
							<th
								className={`px-2 py-1 text-right hidden md:table-cell`}
							>
								%YtdCur
							</th>
						</tr>
					</thead>
					<tbody>
						{renderSection(
							"Americas",
							data.americas,
							"1)",
							isDarkMode
						)}
						{renderSection(
							"EMEA",
							data.emea,
							"2)",
							isDarkMode
						)}
						{renderSection(
							"Asia/Pacific",
							data.asiaPacific,
							"3)",
							isDarkMode
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
