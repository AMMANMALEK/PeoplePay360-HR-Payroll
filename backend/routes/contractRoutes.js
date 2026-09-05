const express = require('express');
const {
  getContractById,
  updateContract,
  deleteContract,
} = require('../controllers/contractController');

const router = express.Router();

router.get('/:contractId', getContractById);
router.put('/:contractId', updateContract);
router.delete('/:contractId', deleteContract);

module.exports = router;
