const API_BASE_URL = "https://api.videosdk.live";
const VIDEOSDK_TOKEN = process.env.REACT_APP_VIDEOSDK_TOKEN;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const getToken = async () => {
	if (VIDEOSDK_TOKEN && BACKEND_URL) {
		console.error(
			"Error: Provide only ONE PARAMETER - either Token or Auth API",
		);
	} else if (VIDEOSDK_TOKEN) {
		return VIDEOSDK_TOKEN;
	} else if (BACKEND_URL) {
		const res = await fetch(`${BACKEND_URL}/get-token`, {
			method: "GET",
		});
		const { token } = await res.json();
		console.log(token);
		return token;
	} else {
		console.error("Error: ", Error("Please add a token or Auth Server URL"));
	}
};

export const createMeeting = async ({ token }) => {
	const url = `${API_BASE_URL}/v2/rooms`;
	const webhookUrl = `${BACKEND_URL}/trans/webhook`;
	const options = {
		method: "POST",
		headers: { Authorization: token, "Content-Type": "application/json" },
		body: JSON.stringify({
			webhook: {
				endPoint: webhookUrl,
				events: [
					"recording-started",
					"recording-stopped",
					"recording-failed",
					"transcription-started",
					"transcription-stopped",
					"transcription-failed",
				],
			},
			autoStartConfig: {
				type: "session-end-and-deactivate",
				duration: 90,
				recording: {
					transcription: {
						enabled: true,
						summary: {
							enabled: true,
							prompt:
								"Write summary in sections like Title, Agenda, Speakers, Action Items, Outlines, Notes and Summary",
						},
					},
				},
			},
		}),
	};

	const { roomId } = await fetch(url, options)
		.then((response) => response.json())
		.catch((error) => console.error("error", error));

	return roomId;
};

export const destroyMeetingRoom = async (token, roomId) => {
	const options = {
		method: "POST",
		headers: {
			Authorization: token,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			roomId: roomId,
		}),
	};
	const url = `https://api.videosdk.live/v2/rooms/deactivate`;
	const response = await fetch(url, options);
	const data = await response.json();
	console.log(data);
};

//No use as of now
export const startTranscription = async (token, roomId) => {
	const url = `https://api.videosdk.live/ai/v1/realtime-transcriptions/start`;
	const options = {
		method: "POST",
		headers: {
			Authorization: token,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			roomId: roomId,
		}),
	};
	const response = await fetch(url, options);
	const data = response.json();
	console.log(data);
};

//No use as of now
export const stopTranscription = async (token, roomId) => {
	const options = {
		method: "POST",
		headers: {
			Authorization: token,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			roomId: roomId,
		}),
	};
	const url = `https://api.videosdk.live/ai/v1/realtime-transcriptions/end`;
	const response = await fetch(url, options);
	const data = await response.json();
	console.log(data);
};

export const getRealtimeTrancription = async (token, roomId) => {
	const options = {
		method: "GET",
		headers: {
			Authorization: token,
			"Content-Type": "application/json",
		},
	};
	const url = `https://api.videosdk.live/ai/v1/realtime-transcriptions/?roomId=${roomId}`;
	const response = await fetch(url, options);
	const data = await response.json();
	console.log(data);
};

export const validateMeeting = async ({ roomId, token }) => {
	const url = `${API_BASE_URL}/v2/rooms/validate/${roomId}`;

	const options = {
		method: "GET",
		headers: { Authorization: token, "Content-Type": "application/json" },
	};

	const result = await fetch(url, options)
		.then((response) => response.json()) //result will have meeting id
		.catch((error) => console.error("error", error));

	return result ? result.roomId === roomId : false;
};
