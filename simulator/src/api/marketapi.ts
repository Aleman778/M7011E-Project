
/***************************************************************************
 * REST API for the market state.
 ***************************************************************************/


import express from "express";
import Simulation from "../simulation";
import ensureAuthenticated from "./auth";
var router = express.Router();


/**
 * Get current market price.
 */
router.put('/price', ensureAuthenticated('manager'), (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            let market = state.powerPlants[req.userId].market;
            market.price = req.body.newPrice;
            if (market.price == req.body.newPrice) {
                return res.status(200).send("Market price was updated");
            } else {
                return res.status(400).send("Market price was not updated");
            }
        }
    } catch(err) {
        console.trace(err);
        console.log("[MarketAPI] Failed to find a requested power plant with id " + req.userId + ".");
    }
    return res.status(400).send("Whoops! We failed to find your market, please try again later.");
});


/**
 * Get the markets suggested price.
 */
router.get('/suggested-price', ensureAuthenticated('manager'), 
    (req: express.Request, res: express.Response) => {
    try {
        if (req.userId != undefined) {
            let state = Simulation.getState();
            return res.status(200).json(state.powerPlants[req.userId].market.suggestedPrice);
        }
    } catch(err) {
        console.trace(err);
        console.log("[MarketAPI] Failed to find a requested power plant with id " + req.userId + ".");
    }
    return res.status(400).send("Whoops! We failed to find your power plant, please try again later.");
});


export = router;
