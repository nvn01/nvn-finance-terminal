"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RealTimeChart } from "./real-time-chart";

interface MarketItem {
	id: string;
	num: string;
	rmi: string;
	value: number;
	change: number;
	pctChange: number;
	avat: number;
	time: string;
	advDcl?: string;
	ytd: number;
	ytdCur: number;
}

interface MarketTableProps {
	marketType: "standard" | "forex" | "crypto";
	isDarkMode: boolean;
	selectedMarkets: string[];
	onToggleMarketSelection: (marketId: string) => void;
	marketData: {
		standard: {
			americas: MarketItem[];
			emea: MarketItem[];
			asiaPacific: MarketItem[];
		};
		forex: {
			major: MarketItem[];
			emerging: MarketItem[];
		};
		crypto: {
			major: MarketItem[];
			altcoins: MarketItem[];
		};
	};
}

const fixedColumnClass =
	"w-[120px] sm:w-[140px] whitespace-nowrap overflow-hidden text-ellipsis";

export function MarketTable({
	marketType,
	isDarkMode,
	selectedMarkets,
	onToggleMarketSelection,
	marketData,
}: MarketTableProps) {
	const router = useRouter();

	const renderSection = (
		title: string,
		items: MarketItem[],
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
						isDarkMode ? "bg-[#1a1a1a]" : "bg-[#e6e6e6]"
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
										onToggleMarketSelection(
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
											onToggleMarketSelection(
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
				<th colSpan={5}></th>
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
									onToggleMarketSelection(
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
									if (
										marketType ===
										"crypto"
									) {
										router.push(
											`/crypto/${symbolSlug}`
										);
									} else if (
										marketType ===
										"forex"
									) {
										router.push(
											`/forex/${symbolSlug}`
										);
									} else {
										router.push(
											`/standard/standard/${symbolSlug}`
										);
									}
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
						{marketType === "crypto" && item.value < 1
							? item.value.toFixed(6)
							: item.value.toLocaleString("en-US", {
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
							{marketType === "crypto" &&
							Math.abs(item.change) < 1
								? item.change.toFixed(6)
								: item.change.toFixed(2)}
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
				</tr>
			))}
		</>
	);

	const getTableContent = () => {
		switch (marketType) {
			case "standard":
				return (
					<>
						{renderSection(
							"Americas",
							marketData.standard.americas,
							"1)"
						)}
						{renderSection(
							"EMEA",
							marketData.standard.emea,
							"2)"
						)}
						{renderSection(
							"Asia/Pacific",
							marketData.standard.asiaPacific,
							"3)"
						)}
					</>
				);
			case "forex":
				return (
					<>
						{renderSection(
							"Major",
							marketData.forex.major,
							"1)"
						)}
						{renderSection(
							"emerging currencies",
							marketData.forex.emerging,
							"2)"
						)}
					</>
				);
			case "crypto":
				return (
					<>
						{renderSection(
							"major",
							marketData.crypto.major,
							"1)"
						)}
						{renderSection(
							"alternative",
							marketData.crypto.altcoins,
							"2)"
						)}
					</>
				);
			default:
				return null;
		}
	};

	const getColumnHeader = () => {
		switch (marketType) {
			case "standard":
				return "Index";
			case "forex":
				return "Currency Pair";
			case "crypto":
				return "Cryptocurrency";
			default:
				return "Market";
		}
	};

	return (
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
							{getColumnHeader()}
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
							Time
						</th>
					</tr>
				</thead>
				<tbody>{getTableContent()}</tbody>
			</table>
		</div>
	);
}
