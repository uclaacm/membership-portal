import * as express from "express";
import * as user_router from "./user";
import * as event_router from "./event";
import * as attendance_router from "./attendance";
import * as leaderboard_router from "./leaderboard";
import { authenticated as auth, router as auth_router } from "./auth";
import * as health_router from "./health";
const router: Router = express.Router();

// Private API - use authentication middleware
router.use('/user', auth, user_router);
router.use('/event', auth, event_router);
router.use('/attendance', auth, attendance_router);
router.use('/leaderboard', auth, leaderboard_router);

// Public API
router.use('/auth', auth_router);
router.use('/health', health_router);

exports = router;
