/**
 * Updates the prosumer production settings.
 */
async function updateProsumerSettings() {
    let capacity = document.getElementById("batteryCapacityInput").value;
    let chargeRatio = document.getElementById("chargeRatioInput").value;
    let consumeRatio = document.getElementById("consumeRatioInput").value;
    await fetch('/prosumer/house/update/settings', {
        method: 'POST',
        headers: {
         'Content-type': 'application/json; charset=UTF-8'  
        },
        body: JSON.stringify({
            capacity: capacity/3600,
            chargeRatio: chargeRatio,
            consumeRatio: consumeRatio,
        })
    });
}
