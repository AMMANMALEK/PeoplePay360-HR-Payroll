const express = require('express');
const {
  getEmployeeContracts,
  createEmployeeContract,
  getActiveEmployeeContract,
  getEmployeeContractForPeriod,
} = require('../controllers/contractController');

const router = express.Router({ mergeParams: true });

router.get('/active', getActiveEmployeeContract);
router.get('/for-period', getEmployeeContractForPeriod);
router.get('/', getEmployeeContracts);
router.post('/', createEmployeeContract);

module.exports = router;
