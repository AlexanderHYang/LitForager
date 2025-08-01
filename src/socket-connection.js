import { io } from "socket.io-client";
import {
    addRecommendationsFromSelectedPapers,
    changeLinkType,
    addSummaryForPaper,
    addKeywordsForPaper,
    addAnnotationsForPaper,
    clearAnnotationsForPaper,
    removeSelectedNodesFromGraph,
    clearNodeSelection,
    unpinNodes,
    addCitationsFromSelectedPaper,
    addReferencesFromSelectedPaper,
    restoreDeletedPapers,
    createClustersFromGemini,
} from "./graph.js";
import { logEvent } from "../main.js";

import { paperDetailsPanelId, setFullScreenUIText } from "./graphics.js";

// Declare a socket variable to be used globally
let socket;
export let host;

export function initializeSocketConnection() {
    // Use the current hostname and connect on port 3000 over HTTPS
    host = window.location.hostname;
    console.log(host);
    socket = io(`https://${host}:3000`, {
        // Set to auto-reconnect up to 5 times
        reconnectionAttempts: 1,
        // Delay between reconnection attempts (in ms)
        // reconnectionDelay: 500,
    });

    // Log when the connection is established
    socket.on("connect", () => {
        logEvent("Socket connected", { socketId: socket.id });
        console.log(`Socket connected: ${socket.id}. Connected to server at: ${host}:3000`);
    });

    // Log any connection errors
    socket.on("connect_error", (error) => {
        logEvent("Socket connection error", { error: error.message });
        console.error("Connection Error:", error);
    });

    // When reconnection attempts have failed, log and disconnect the socket
    socket.io.on("reconnect_failed", () => {
        logEvent("Socket reconnection failed", {});
        console.error("All connection attempts failed. Closing socket.");
        socket.disconnect();
    });

    // Set up custom event listeners
    socket.on("recommendByThematicSimilarity", (data) => {
        logEvent("Socket - on recommendByThematicSimilarity", { data });
        console.log("Received socket.io event:", data);
        addRecommendationsFromSelectedPapers();
    });

    socket.on("recommendByCitations", (data) => {
        logEvent("Socket - on recommendByCitations", { data });
        console.log("Received socket.io event:", data);
        addCitationsFromSelectedPaper();
    });

    socket.on("recommendByReferences", (data) => {
        logEvent("Socket - on recommendByReferences", { data });
        console.log("Received socket.io event:", data);
        addReferencesFromSelectedPaper();
    });

    socket.on("toggleLinks", (data) => {
        logEvent("Socket - on toggleLinks", { data });
        console.log("Received socket.io event:", data);
        changeLinkType();
    });

    socket.on("summarizePaperGemini", (data) => {
        logEvent("Socket - on summarizePaperGemini", { data });
        console.log("Received socket.io event:", data);
        addSummaryForPaper(data.response, data.paperId);
    });

    socket.on("generateKeywordsGemini", (data) => {
        logEvent("Socket - on generateKeywordsGemini", { data });
        console.log("Received socket.io event:", data);
        addKeywordsForPaper(data.response, data.paperId);
    });

    socket.on("annotateGemini", (data) => {
        logEvent("Socket - on annotateGemini", { data });
        console.log("Received socket.io event:", data);
        addAnnotationsForPaper(data.response, data.paperId);
    });

    socket.on("createClustersGemini", (data) => {
        logEvent("Socket - on createClustersGemini", { data });
        console.log("Received socket.io event for createClustersGemini:", data);
        createClustersFromGemini(data.clusters);
    });

    socket.on("deletePaper", (data) => {
        logEvent("Socket - on deletePaper", { data });
        console.log("Received socket.io event:", data);
        removeSelectedNodesFromGraph();
    });

    socket.on("clearNodeSelection", (data) => {
        logEvent("Socket - on clearNodeSelection", { data });
        console.log("Received socket.io event:", data);
        clearNodeSelection();
    });

    socket.on("unpinNodes", (data) => {
        logEvent("Socket - on unpinNodes", { data });
        console.log("Received socket.io event:", data);
        unpinNodes();
    });

    socket.on("restoreDeletedPapers", (data) => {
        logEvent("Socket - on restoreDeletedPapers", { data });
        console.log("Received socket.io event:", data);
        restoreDeletedPapers();
    });

    socket.on("clearAnnotation", (data) => {
        console.log("Received socket.io event:", data);
        clearAnnotationsForPaper(paperDetailsPanelId);
    });

    return socket;
}

// Also export the socket so it can be imported elsewhere
export { socket };
