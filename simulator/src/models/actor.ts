
/***************************************************************************
 * Actor model is simply an interface for a user in the simulation.
 ***************************************************************************/


/**
 * Actor interface, user in the simulation.
 * Does nothing in the simulation only used in REST APIs.
 */
export default interface Actor {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly removed: boolean;
}
