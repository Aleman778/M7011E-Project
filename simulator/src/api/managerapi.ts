
/***************************************************************************
 * REST API for the manager simulator.
 ***************************************************************************/

import express from "express";
import House from "../models/house";
import Simulation from "../simulation";
import ensureAuthenticated from "./auth";
import { ElectricityGridDB, eq } from "../database";
import * as utils from "./utils";
var router = express.Router();


