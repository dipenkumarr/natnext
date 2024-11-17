"use client";

import MoodPrediction from "@/components/MoodPrediction";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<MoodPrediction />
		</main>
	);
}
