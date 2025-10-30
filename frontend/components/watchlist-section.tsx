"use client";

import { Plus } from "lucide-react";
import { StockTile } from "./stock-tile";

interface WatchlistSectionProps {
	watchlist: any[];
	router: any;
	isDarkMode: boolean;
}

export function WatchlistSection({
	watchlist,
	router,
	isDarkMode,
}: WatchlistSectionProps) {
	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-white text-lg font-bold">
					Watchlist
				</h2>
				<div className="flex gap-2">
					{/* Add any header buttons here if needed */}
				</div>
			</div>

			{/* Horizontal Scrolling Container */}
			<div className="overflow-x-auto overflow-y-hidden h-[calc(100vh-200px)]">
				<div
					className="flex gap-3 pb-4"
					style={{ width: "max-content" }}
				>
					{/* Create rows of stock tiles */}
					<div className="flex flex-col gap-3">
						{watchlist
							.slice(
								0,
								Math.ceil(watchlist.length / 3)
							)
							.map((stock, index) => (
								<div
									key={`row1-${stock.symbol}`}
									className="w-48 h-24"
								>
									<StockTile
										symbol={
											stock.symbol
										}
										name={stock.name}
										price={stock.price}
										change={
											stock.change
										}
										changePercent={
											stock.changePercent
										}
										chartData={
											stock.chartData
										}
										onClick={() =>
											router.push(
												`/standard/standard/${stock.symbol.toLowerCase()}`
											)
										}
									/>
								</div>
							))}
					</div>

					<div className="flex flex-col gap-3">
						{watchlist
							.slice(
								Math.ceil(watchlist.length / 3),
								Math.ceil(
									(watchlist.length * 2) / 3
								)
							)
							.map((stock, index) => (
								<div
									key={`row2-${stock.symbol}`}
									className="w-48 h-24"
								>
									<StockTile
										symbol={
											stock.symbol
										}
										name={stock.name}
										price={stock.price}
										change={
											stock.change
										}
										changePercent={
											stock.changePercent
										}
										chartData={
											stock.chartData
										}
										onClick={() =>
											router.push(
												`/standard/standard/${stock.symbol.toLowerCase()}`
											)
										}
									/>
								</div>
							))}
					</div>

					<div className="flex flex-col gap-3">
						{watchlist
							.slice(
								Math.ceil(
									(watchlist.length * 2) / 3
								)
							)
							.map((stock, index) => (
								<div
									key={`row3-${stock.symbol}`}
									className="w-48 h-24"
								>
									<StockTile
										symbol={
											stock.symbol
										}
										name={stock.name}
										price={stock.price}
										change={
											stock.change
										}
										changePercent={
											stock.changePercent
										}
										chartData={
											stock.chartData
										}
										onClick={() =>
											router.push(
												`/standard/standard/${stock.symbol.toLowerCase()}`
											)
										}
									/>
								</div>
							))}
					</div>

					{/* Add Stock Button */}
					<div className="flex flex-col gap-3">
						<div className="w-48 h-24 bg-blue-600 p-4 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors flex flex-col items-center justify-center text-white">
							<Plus className="h-6 w-6 mb-1" />
							<span className="text-sm font-bold">
								Add Stock
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
