
/***************************************************************************
 * REST API for the market state.
 ***************************************************************************/


import express from "express";
import Simulation from "../simulation";
import authenticate from "./auth";
var router = express.Router();


/**
 * Get current market price.
 */
router.put('/price', authenticate('manager'), (req: express.Request, res: express.Response) => {
    if (req.actor == undefined) return res.send(401).send("Not authenticated!");
    try {
            let state = Simulation.getState();
            let market = state.powerPlants[req.actor.id].market;
            market.price = req.body.newPrice;
            if (market.price == req.body.newPrice) {
                return res.status(200).send("Market price was updated");
            } else {
                return res.status(400).send("Market price was not updated");
            }
    } catch(err) {
        console.trace(err);
        console.log("[MarketAPI] Failed to find a requested power plant with id " + req.actor.id + ".");
    }
    return res.status(400).send("Whoops! We failed to find your market, please try again later.");
});


/**
 * Get the markets suggested price.
 */
router.get('/suggested-price', authenticate('manager'), 
    (req: express.Request, res: express.Response) => {
    if (req.actor == undefined) return res.send(401).send("Not authenticated!");
    try {
        let state = Simulation.getState();
        return res.status(200).json(state.powerPlants[req.actor.id].market.suggestedPrice);
    } catch(err) {
        console.trace(err);
        console.log("[MarketAPI] Failed to find a requested power plant with id " + req.actor.id + ".");
    }
    return res.status(400).send("Whoops! We failed to find your power plant, please try again later.");
});


export = router;
