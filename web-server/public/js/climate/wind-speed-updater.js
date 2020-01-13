/******************************************************************************
 * Updates the wind speed field.
 ******************************************************************************/


let windSocket;


/**
 * Opens a web socket for receiving wind speed data.
 */
function loadWindSpeedData() {
    windSocket = new WebSocket("ws://localhost:8000");

    /**
     * Updates the current wind speed data fields every time a message is received.
     */
    windSocket.onmessage = function (event) {
        const windData = JSON.parse(event.data);
        document.getElementById("windSpeed").innerHTML = windData.wind_speed.toFixed(3) + " " + windData.unit;
    }
}


/**
 * Closes the web socket used to receive wind speed data.
 * Note: Call when the page is unloaded.
 */
function unloadWindSpeedData() {
    windSocket.close();
}
