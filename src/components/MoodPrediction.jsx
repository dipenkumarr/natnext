import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Brain, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress"; // Add this if you haven't already

const MoodPrediction = () => {
	const [status, setStatus] = useState("idle");
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);
	const [socket, setSocket] = useState(null);
	const [progress, setProgress] = useState(0);
	const [timeRemaining, setTimeRemaining] = useState(null);

	useEffect(() => {
		// Initialize socket connection with error handling
		const newSocket = io("http://localhost:5000", {
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
		});

		newSocket.on("connect", () => {
			console.log("Connected to server");
			setError(null);
		});

		newSocket.on("connect_error", (err) => {
			console.error("Connection error:", err);
			setError(
				"Failed to connect to the server. Please ensure the server is running."
			);
		});

		newSocket.on("status_update", (data) => {
			console.log("Status update:", data);
			setStatus(data.status);

			if (data.status === "error") {
				setError(data.message);
			} else if (data.progress !== undefined) {
				setProgress(data.progress);
				setTimeRemaining(data.timeRemaining);
			}
		});

		newSocket.on("final_result", (data) => {
			console.log("Final result:", data);
			if (data.status === "complete") {
				setResult(data);
				setStatus("complete");
				setProgress(100);
			} else {
				setError(data.message);
				setStatus("error");
			}
		});

		setSocket(newSocket);

		return () => {
			newSocket.close();
		};
	}, []);

	const getStatusDisplay = () => {
		switch (status) {
			case "idle":
				return "Ready to start recording";
			case "starting":
				return "Initializing Muse headset...";
			case "Recording started":
				return "Recording in progress (3 minutes)";
			case "Processing data":
				return "Processing EEG data...";
			case "complete":
				return "Analysis complete";
			case "error":
				return "Error occurred";
			default:
				return status;
		}
	};

	const startRecording = async () => {
		try {
			setStatus("starting");
			setError(null);
			setResult(null);
			setProgress(0);
			setTimeRemaining(null);

			const response = await fetch("http://localhost:5000/start", {
				method: "POST",
			});

			const data = await response.json();
			if (data.status === "error") {
				setError(data.message);
				setStatus("error");
			}
		} catch (err) {
			setError(
				"Failed to connect to server. Please ensure the server is running."
			);
			setStatus("error");
		}
	};

	const formatTimeRemaining = (seconds) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className="max-w-2xl mx-auto p-4">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Brain className="h-6 w-6" />
						EEG Mood Analysis
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Button
							onClick={startRecording}
							disabled={
								status !== "idle" &&
								status !== "complete" &&
								status !== "error"
							}
							className="w-full"
						>
							{status === "starting" || status === "recording" ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Recording...
								</>
							) : (
								"Start Recording"
							)}
						</Button>

						{(status === "recording" ||
							status === "Processing data") && (
							<div className="space-y-2">
								<Progress value={progress} />
								<div className="text-sm text-gray-500 text-center">
									{timeRemaining &&
										`Time remaining: ${formatTimeRemaining(
											timeRemaining
										)}`}
								</div>
							</div>
						)}

						<div className="text-sm text-gray-500">
							Status: {getStatusDisplay()}
						</div>

						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						{result && (
							<div className="space-y-2">
								<div className="text-lg font-semibold">
									Results:
								</div>
								<div
									className={`text-2xl font-bold ${getEmotionColor(
										result.emotion
									)}`}
								>
									{result.emotion.charAt(0).toUpperCase() +
										result.emotion.slice(1)}
								</div>
								<div className="text-sm text-gray-500">
									Confidence:{" "}
									{(result.confidence * 100).toFixed(1)}%
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default MoodPrediction;

// import React, { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { AlertCircle, Brain, Loader2 } from "lucide-react";
// import { Alert, AlertDescription } from "@/components/ui/alert";

// const MoodPrediction = () => {
// 	const [status, setStatus] = useState("idle");
// 	const [result, setResult] = useState(null);
// 	const [error, setError] = useState(null);
// 	const [socket, setSocket] = useState(null);

// 	useEffect(() => {
// 		// Initialize socket connection
// 		const newSocket = io("http://localhost:5000");

// 		newSocket.on("connect", () => {
// 			console.log("Connected to server");
// 		});

// 		newSocket.on("status_update", (data) => {
// 			setStatus(data.status);
// 			if (data.status === "error") {
// 				setError(data.message);
// 			}
// 		});

// 		newSocket.on("final_result", (data) => {
// 			if (data.status === "complete") {
// 				setResult(data);
// 				setStatus("complete");
// 			} else {
// 				setError(data.message);
// 				setStatus("error");
// 			}
// 		});

// 		setSocket(newSocket);

// 		return () => {
// 			newSocket.close();
// 		};
// 	}, []);

// 	const startRecording = async () => {
// 		try {
// 			setStatus("starting");
// 			setError(null);
// 			setResult(null);

// 			const response = await fetch("http://localhost:5000/start", {
// 				method: "POST",
// 			});

// 			const data = await response.json();
// 			if (data.status === "error") {
// 				setError(data.message);
// 				setStatus("error");
// 			}
// 		} catch (err) {
// 			setError("Failed to connect to server");
// 			setStatus("error");
// 		}
// 	};

// 	const getStatusDisplay = () => {
// 		switch (status) {
// 			case "idle":
// 				return "Ready to start recording";
// 			case "starting":
// 				return "Initializing Muse headset...";
// 			case "Recording started":
// 				return "Recording in progress (3 minutes)";
// 			case "Processing data":
// 				return "Processing EEG data...";
// 			case "complete":
// 				return "Analysis complete";
// 			case "error":
// 				return "Error occurred";
// 			default:
// 				return status;
// 		}
// 	};

// 	const getEmotionColor = (emotion) => {
// 		switch (emotion) {
// 			case "positive":
// 				return "text-green-500";
// 			case "negative":
// 				return "text-red-500";
// 			default:
// 				return "text-blue-500";
// 		}
// 	};

// 	return (
// 		<div className="max-w-2xl mx-auto p-4">
// 			<Card>
// 				<CardHeader>
// 					<CardTitle className="flex items-center gap-2">
// 						<Brain className="h-6 w-6" />
// 						EEG Mood Analysis
// 					</CardTitle>
// 				</CardHeader>
// 				<CardContent>
// 					<div className="space-y-4">
// 						<div className="flex items-center justify-between">
// 							<Button
// 								onClick={startRecording}
// 								disabled={
// 									status !== "idle" &&
// 									status !== "complete" &&
// 									status !== "error"
// 								}
// 								className="w-full"
// 							>
// 								{status === "starting" ||
// 								status === "Recording started" ? (
// 									<>
// 										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
// 										Recording...
// 									</>
// 								) : (
// 									"Start Recording"
// 								)}
// 							</Button>
// 						</div>

// 						<div className="text-sm text-gray-500">
// 							Status: {getStatusDisplay()}
// 						</div>

// 						{error && (
// 							<Alert variant="destructive">
// 								<AlertCircle className="h-4 w-4" />
// 								<AlertDescription>{error}</AlertDescription>
// 							</Alert>
// 						)}

// 						{result && (
// 							<div className="space-y-2">
// 								<div className="text-lg font-semibold">
// 									Results:
// 								</div>
// 								<div
// 									className={`text-2xl font-bold ${getEmotionColor(
// 										result.emotion
// 									)}`}
// 								>
// 									{result.emotion.charAt(0).toUpperCase() +
// 										result.emotion.slice(1)}
// 								</div>
// 								<div className="text-sm text-gray-500">
// 									Confidence:{" "}
// 									{(result.confidence * 100).toFixed(1)}%
// 								</div>
// 							</div>
// 						)}
// 					</div>
// 				</CardContent>
// 			</Card>
// 		</div>
// 	);
// };

// export default MoodPrediction;
