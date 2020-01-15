

/***************************************************************************
 * Authorization middleware for validating the auth token.
 ***************************************************************************/


import express from "express";
import Actor from "../models/actor";
import { verify } from "jsonwebtoken";
import { ElectricityGridDB, eq } from "../database";


/**
 * Authenticate middleware checks if the given bearer token is valid.
 * Also can perform user access control if a specified role is given.
 * @param {string} role optionally check if user is of specific role
 */
export default function authenticate(role?: string): any {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            let token = req.headers.authorization;
            let secret = process.env.WS_PRIVATE_KEY;
            if (token != undefined && secret != undefined) {
                token = token.slice(7);
                let result = <Decoded> verify(token, secret, {algorithms: ["HS256"]});
                let actor = await ElectricityGridDB.table('users')
                    .select<Actor>([], [eq('id', result.userId)]);
                if (actor != undefined && actor.length == 1) {
                    if (role != undefined && actor[0].role != role) {
                        return res.status(401).send("Permission denied! This is only allowed for " + role + "s.");
                    }
                    req.actor = actor[0];
                    next();
                } else {
                    return res.status(401).send("The user you tried to access does not exist.");
                }
            } else {
                return res.status(401).send("You are not authenticated.");
            }
        } catch(err) {
            console.trace(err);
            return res.status(400).send("Your authentication token is invalid.");
        }
    }
}


/**
 * The decoded message.
 */
interface Decoded {
    readonly userId: string;
}
