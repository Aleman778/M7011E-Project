

/***************************************************************************
 * Authorization middleware for validating the auth token.
 ***************************************************************************/


import express from "express";
import { verify } from "jsonwebtoken";
import { ElectricityGridDB, eq } from "../database";


export default function ensureAuthenticated(role: string): any {
    return async (req: express.Request, res: express.Response, next: any) => {
        try {
            let token = req.headers.authorization;
            let secret = process.env.WS_PRIVATE_KEY;
            if (token != undefined && secret != undefined) {
                token = token.slice(7);
                let result = <Decoded> verify(token, secret, {algorithms: ["HS256"]});
                let user = await ElectricityGridDB.table('users')
                    .select<User>([], [eq('id', result.userId)]);
                if (user != undefined && user.length == 1) {
                    if (user[0].role != role) {
                        res.status(401).send("Permission denied! This is only allowed for " + role + "s.");
                    }
                    req.userId = user[0].id;
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


/**
 * The user id retrived from the database.
 */
interface User {
    readonly id: string;
    readonly role: string;
}
