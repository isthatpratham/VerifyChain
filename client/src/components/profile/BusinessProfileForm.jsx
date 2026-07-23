import { useState } from 'react';
import {
  Input,
  SubmitButton,
  ErrorBanner,
} from '../auth/AuthFormComponents';

const BUSINESS_TYPES = [
  { value: 'MANUFACTURING', label: 'Manufacturing' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'TRADING', label: 'Trading' },
  { value: 'FOOD_PROCESSING', label: 'Food Processing' },
  { value: 'CONSTRUCTION', label: 'Construction' },
  { value: 'OTHER', label: 'Other' },
];

export function BusinessProfileForm({ initialValues = null, onSubmit, isEdit = false }) {
  const [formData, setFormData] = useState({
    businessName: initialValues?.businessName || '',
    gstin: initialValues?.gstin || '',
    udyamNumber: initialValues?.udyamNumber || '',
    businessType: initialValues?.businessType || 'MANUFACTURING',
    sector: initialValues?.sector || '',
    state: initialValues?.state || '',
    district: initialValues?.district || '',
    employeeCount: initialValues?.employeeCount !== undefined ? initialValues.employeeCount : '',
    annualTurnoverLakh: initialValues?.annualTurnoverLakh !== undefined ? initialValues.annualTurnoverLakh : '',
    isFoodBusiness: initialValues?.isFoodBusiness || false,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business Name is required';
    }

    if (!formData.gstin.trim()) {
      newErrors.gstin = 'GSTIN is required';
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin.trim())) {
      newErrors.gstin = 'Invalid GSTIN format (e.g., 27AABCU9603R1ZX)';
    }

    if (!formData.udyamNumber.trim()) {
      newErrors.udyamNumber = 'Udyam Registration Number is required';
    } else if (!/^UDYAM-[A-Z]{2}-\d{2}-\d{7}$/.test(formData.udyamNumber.trim())) {
      newErrors.udyamNumber = 'Invalid format (e.g., UDYAM-MH-00-0012345)';
    }

    if (!formData.businessType) {
      newErrors.businessType = 'Business Type is required';
    }

    if (!formData.sector.trim()) {
      newErrors.sector = 'Industry Sector is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (formData.employeeCount === '' || formData.employeeCount === null) {
      newErrors.employeeCount = 'Employee count is required';
    } else if (parseInt(formData.employeeCount, 10) < 0) {
      newErrors.employeeCount = 'Employee count must be 0 or greater';
    }

    if (formData.annualTurnoverLakh !== '' && formData.annualTurnoverLakh !== null) {
      if (parseFloat(formData.annualTurnoverLakh) < 0) {
        newErrors.annualTurnoverLakh = 'Annual turnover must be 0 or greater';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        businessName: formData.businessName.trim(),
        gstin: formData.gstin.trim().toUpperCase(),
        udyamNumber: formData.udyamNumber.trim().toUpperCase(),
        businessType: formData.businessType,
        sector: formData.sector.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        employeeCount: parseInt(formData.employeeCount, 10),
        annualTurnoverLakh: formData.annualTurnoverLakh !== '' ? parseFloat(formData.annualTurnoverLakh) : null,
        isFoodBusiness: Boolean(formData.isFoodBusiness),
      };

      await onSubmit(payload);
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.details && Array.isArray(data.details)) {
          const fieldErrors = {};
          data.details.forEach((item) => {
            if (item.field) fieldErrors[item.field] = item.message;
          });
          setErrors(fieldErrors);
        }
        setServerError(data.error || 'Failed to save business profile.');
      } else {
        setServerError('Network or server error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
      <ErrorBanner message={serverError} />
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="businessName"
            label="Business Name"
            placeholder="e.g., Gupta Textiles Pvt Ltd"
            value={formData.businessName}
            onChange={handleChange}
            error={errors.businessName}
            required
            disabled={loading}
          />
          <Input
            id="gstin"
            label="GSTIN"
            placeholder="27AABCU9603R1ZX"
            value={formData.gstin}
            onChange={handleChange}
            error={errors.gstin}
            required
            disabled={loading || isEdit}
          />
          <Input
            id="udyamNumber"
            label="Udyam Registration Number"
            placeholder="UDYAM-MH-00-0012345"
            value={formData.udyamNumber}
            onChange={handleChange}
            error={errors.udyamNumber}
            required
            disabled={loading || isEdit}
          />
          <div className="mb-4">
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-light disabled:bg-gray-100"
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.businessType && (
              <p className="mt-1 text-xs text-red-600">{errors.businessType}</p>
            )}
          </div>
          <Input
            id="sector"
            label="Industry Sector"
            placeholder="e.g., Textiles, Auto Components"
            value={formData.sector}
            onChange={handleChange}
            error={errors.sector}
            required
            disabled={loading}
          />
          <Input
            id="state"
            label="State"
            placeholder="e.g., Maharashtra"
            value={formData.state}
            onChange={handleChange}
            error={errors.state}
            required
            disabled={loading}
          />
          <Input
            id="district"
            label="District"
            placeholder="e.g., Surat, Pune"
            value={formData.district}
            onChange={handleChange}
            error={errors.district}
            required
            disabled={loading}
          />
          <Input
            id="employeeCount"
            label="Employee Count"
            type="number"
            placeholder="e.g., 12"
            value={formData.employeeCount}
            onChange={handleChange}
            error={errors.employeeCount}
            required
            disabled={loading}
          />
          <Input
            id="annualTurnoverLakh"
            label="Annual Turnover (₹ Lakhs)"
            type="number"
            placeholder="e.g., 45.5"
            value={formData.annualTurnoverLakh}
            onChange={handleChange}
            error={errors.annualTurnoverLakh}
            disabled={loading}
          />
          <div className="mb-4 flex items-center h-full pt-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isFoodBusiness"
                checked={formData.isFoodBusiness}
                onChange={handleChange}
                disabled={loading}
                className="rounded border-gray-300 text-brand focus:ring-brand-light h-4 w-4"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">
                Is this a Food Business? (FSSAI required)
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <SubmitButton loading={loading}>
            {isEdit ? 'Update Profile' : 'Complete Setup & Sync Compliance'}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
