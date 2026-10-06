const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/;

function isValidGstin(gstin) {
  return typeof gstin === 'string' && GSTIN_REGEX.test(gstin.trim().toUpperCase());
}

function isValidPan(pan) {
  return typeof pan === 'string' && PAN_REGEX.test(pan.trim().toUpperCase());
}

function isValidUdyam(udyam) {
  return typeof udyam === 'string' && UDYAM_REGEX.test(udyam.trim().toUpperCase());
}

module.exports = {
  GSTIN_REGEX,
  PAN_REGEX,
  UDYAM_REGEX,
  isValidGstin,
  isValidPan,
  isValidUdyam,
};

