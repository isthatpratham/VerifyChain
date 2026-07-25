/**
 * MockOCRProvider.js
 * Offline Deterministic Mock OCR Provider.
 */

const AbstractOCRProvider = require('./AbstractOCRProvider');

class MockOCRProvider extends AbstractOCRProvider {
  constructor() {
    super('MOCK_OCR');
  }

  async extractText({ fileName = 'sample_document.pdf', documentType = 'GST_CERTIFICATE' }) {
    const isGst = fileName.toLowerCase().includes('gst') || documentType === 'GST_CERTIFICATE';
    const isPan = fileName.toLowerCase().includes('pan') || documentType === 'PAN';
    const isUdyam = fileName.toLowerCase().includes('udyam') || documentType === 'UDYAM';

    let rawText = '';
    if (isPan) {
      rawText = `GOVERNMENT OF INDIA - INCOME TAX DEPARTMENT\nPERMANENT ACCOUNT NUMBER: AAAAA0000A\nNAME: ACME HEAVY ENGINEERING PVT LTD\nDATE OF INCORPORATION: 15/04/2018`;
    } else if (isUdyam) {
      rawText = `MINISTRY OF MICRO, SMALL AND MEDIUM ENTERPRISES\nUDYAM REGISTRATION CERTIFICATE\nUDYAM NUMBER: UDYAM-MH-01-0012345\nNAME OF ENTERPRISE: ACME HEAVY ENGINEERING PVT LTD\nCLASSIFICATION: SMALL ENTERPRISE`;
    } else {
      rawText = `GOVERNMENT OF INDIA - GOODS AND SERVICES TAX REGISTRATION CERTIFICATE\nREGISTRATION NUMBER: 27AAAAA0000A1Z5\nLEGAL NAME: ACME HEAVY ENGINEERING PVT LTD\nTRADE NAME: ACME ENGINEERING\nDATE OF LIABILITY: 01/07/2017\nTYPE OF REGISTRATION: REGULAR\nJURISDICTION: WARD 101 MUMBAI MAHARASHTRA`;
    }

    return {
      providerCode: this.providerCode,
      rawText,
      pageCount: 1,
      layoutBlocks: [
        { blockIndex: 1, text: rawText, confidence: 0.98, pageIndex: 1 },
      ],
    };
  }
}

module.exports = MockOCRProvider;
