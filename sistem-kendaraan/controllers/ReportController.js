const TripLog = require('../models/TripLog');
const db = require('../config/database'); 

exports.getCostRecap = async (req, res) => {
    try {
        const totalCosts = await TripLog.findAll({
            where: { validation_status: 'validated' }, 
            attributes: [
                [db.fn('SUM', db.col('fuel_cost')), 'total_fuel'],
                [db.fn('SUM', db.col('toll_cost')), 'total_toll'],
                [db.fn('SUM', db.col('parking_cost')), 'total_parking'],
                [db.fn('SUM', db.col('other_cost')), 'total_other'] 
            ]
        });

        return res.status(200).json({
            status: 'Sukses',
            message: 'Berhasil merekap total biaya operasional kendaraan',
            data: totalCosts[0] 
        });

    } catch (error) {
        return res.status(500).json({ status: 'Error', message: error.message });
    }
};