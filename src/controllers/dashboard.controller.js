import { information } from "../services/dashboard.service.js";

export const DashboardController = {
    information: async (req, res, next) => {
        try {
            const data = await information();
            res.json(data);
        } catch (error) {
            next(error);
        } 
    }
}