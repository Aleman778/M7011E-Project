
/***************************************************************************
 * REST API for the power plant simulator
 ***************************************************************************/


import express from "express";
import PowerPlant from "../models/power-plant";
import Simulation from "../simulation";
import ensureAuthenticated from "./auth";
import { ElectricityGridDB, eq } from "../database";
import * as utils from "./utils";
var router = express.Router();





export = router;
