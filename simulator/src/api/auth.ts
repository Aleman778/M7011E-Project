

/***************************************************************************
 * Authorization middleware for validating the auth token.
 ***************************************************************************/


import { verify } from "jsonwebtoken";
import { ElectricityGridDB, eq } from "../database";


export async function ensureAuthenticated(req: any, res: any, next: any) {
    try {
        let token = req.headers.authorization;
        let secret = process.env.WS_PRIVATE_KEY;
        if (token != undefined && secret != undefined) {
            let userId: string = <string> verify(
                token, secret, {algorithms: ["HS256"]});
            let user = await ElectricityGridDB.table('users')
                .select<User>([], [eq('id', userId)]);
            if (user != undefined) {
                req.body.user = user;
                next();
            } else {
                return res.status(401).send("The provided access token is invalid.");
            }
        } else {
            return res.status(401).send("You are not authenticated.");
        }
    } catch(err) {
        console.trace(err);
        return res.status(400).send("Your authentication token is invalid.");
    }
}


/**
 * Data interface for the User schema.
 */
export interface User {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly role: string;
}
