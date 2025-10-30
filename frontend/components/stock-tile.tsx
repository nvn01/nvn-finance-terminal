"use client";

import { useEffect, useRef } from "react";

interface StockTileProps {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	chartData?: number[];
	onClick?: () => void;
}

export function StockTile({
	symbol,
	name,
	price,
	change,
	changePercent,
	chartData,
	onClick,
}: StockTileProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const getBackgroundColor = () => {
		if (changePercent > 0) return "bg-green-600";
		if (changePercent < 0) return "bg-red-600";
		return "bg-orange-500";
	};

	const getArrowSymbol = () => {
		if (changePercent > 0) return "▲";
		if (changePercent < 0) return "▼";
		return "=";
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !chartData) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const width = canvas.width;
		const height = canvas.height;
		const padding = 2;

		ctx.clearRect(0, 0, width, height);

		if (chartData.length < 2) return;

		const min = Math.min(...chartData);
		const max = Math.max(...chartData);
		const range = max - min || 1;

		ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
		ctx.lineWidth = 1;
		ctx.beginPath();

		chartData.forEach((value, index) => {
			const x =
				padding +
				(index / (chartData.length - 1)) *
					(width - 2 * padding);
			const y =
				height -
				padding -
				((value - min) / range) * (height - 2 * padding);

			if (index === 0) {
				ctx.moveTo(x, y);
			} else {
				ctx.lineTo(x, y);
			}
		});

		ctx.stroke();
	}, [chartData]);

	return (
		<div
			className={`${getBackgroundColor()} p-3 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity text-white relative overflow-hidden h-full min-h-[96px]`}
			onClick={onClick}
		>
			<div className="flex justify-between items-start mb-2">
				<div className="flex-1 min-w-0">
					<div className="text-lg font-bold truncate">
						{symbol}
					</div>
					<div className="text-xs opacity-80 leading-tight truncate">
						{name.length > 20
							? name.substring(0, 20) + "..."
							: name}
					</div>
				</div>
				<div className="text-right ml-2">
					<div className="text-xs opacity-80">Change</div>
					<div className="text-xs font-medium">
						{change > 0 ? "+" : ""}
						{change.toFixed(0)}
					</div>
				</div>
			</div>

			<div className="flex justify-between items-end mb-2">
				<div className="flex-1">
					<div className="text-xs opacity-80">Last</div>
					<div className="flex items-center gap-1">
						<span className="text-xs">
							{getArrowSymbol()}
						</span>
						<span className="text-lg font-bold">
							{price.toLocaleString()}
						</span>
					</div>
				</div>
				<div className="text-right">
					<div className="text-sm font-bold">
						{changePercent > 0 ? "+" : ""}
						{changePercent.toFixed(2)}%
					</div>
				</div>
			</div>

			{chartData && (
				<div className="absolute bottom-6 left-3 right-3">
					<canvas
						ref={canvasRef}
						width={80}
						height={16}
						className="w-full h-3 opacity-50"
					/>
				</div>
			)}

			<div className="absolute bottom-1 right-2 text-xs opacity-40">
				{(price * 0.98).toFixed(0)}-{(price * 1.02).toFixed(0)}
			</div>
		</div>
	);
}
