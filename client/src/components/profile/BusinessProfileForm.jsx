/**
 * BusinessProfileForm.jsx
 * Enterprise MSME Profile Form with UI Primitives & resilient value binding.
 */
import { useState } from 'react';
import { Field } from '../../ui/form/Field';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';

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
    const { name, id, value, type, checked } = e.target;
    const key = name || id;
    setFormData((prev) => ({
      ...prev,
      [key]: type === 'checkbox' ? checked : value,
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
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
    <div className="p-6 sm:p-8 rounded-[--radius-md] border border-[--vc-border] bg-[--vc-surface-raised]">
      {serverError && (
        <div className="mb-6">
          <Alert variant="error" title="Form Error">
            {serverError}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Business Name" htmlFor="businessName" required error={errors.businessName}>
            <Input
              id="businessName"
              name="businessName"
              placeholder="e.g., Gupta Textiles Pvt Ltd"
              value={formData.businessName}
              onChange={handleChange}
              error={errors.businessName}
              disabled={loading}
              required
            />
          </Field>

          <Field label="GSTIN" htmlFor="gstin" required error={errors.gstin} hint={isEdit ? 'GSTIN cannot be changed after registration' : '15-digit Tax Identifier'}>
            <Input
              id="gstin"
              name="gstin"
              placeholder="27AABCU9603R1ZX"
              value={formData.gstin}
              onChange={handleChange}
              error={errors.gstin}
              disabled={loading || isEdit}
              required
            />
          </Field>

          <Field label="Udyam Registration Number" htmlFor="udyamNumber" required error={errors.udyamNumber}>
            <Input
              id="udyamNumber"
              name="udyamNumber"
              placeholder="UDYAM-MH-00-0012345"
              value={formData.udyamNumber}
              onChange={handleChange}
              error={errors.udyamNumber}
              disabled={loading || isEdit}
              required
            />
          </Field>

          <Field label="Business Type" htmlFor="businessType" required error={errors.businessType}>
            <Select
              id="businessType"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              disabled={loading}
              options={BUSINESS_TYPES}
            />
          </Field>

          <Field label="Industry Sector" htmlFor="sector" required error={errors.sector}>
            <Input
              id="sector"
              name="sector"
              placeholder="e.g., Textiles, Auto Components"
              value={formData.sector}
              onChange={handleChange}
              error={errors.sector}
              disabled={loading}
              required
            />
          </Field>

          <Field label="State Jurisdiction" htmlFor="state" required error={errors.state}>
            <Input
              id="state"
              name="state"
              placeholder="e.g., Maharashtra"
              value={formData.state}
              onChange={handleChange}
              error={errors.state}
              disabled={loading}
              required
            />
          </Field>

          <Field label="District" htmlFor="district" required error={errors.district}>
            <Input
              id="district"
              name="district"
              placeholder="e.g., Surat, Pune"
              value={formData.district}
              onChange={handleChange}
              error={errors.district}
              disabled={loading}
              required
            />
          </Field>

          <Field label="Employee Count" htmlFor="employeeCount" required error={errors.employeeCount}>
            <Input
              id="employeeCount"
              name="employeeCount"
              type="number"
              placeholder="e.g., 12"
              value={formData.employeeCount}
              onChange={handleChange}
              error={errors.employeeCount}
              disabled={loading}
              required
            />
          </Field>

          <Field label="Annual Turnover (₹ Lakhs)" htmlFor="annualTurnoverLakh" error={errors.annualTurnoverLakh}>
            <Input
              id="annualTurnoverLakh"
              name="annualTurnoverLakh"
              type="number"
              placeholder="e.g., 45.5"
              value={formData.annualTurnoverLakh}
              onChange={handleChange}
              error={errors.annualTurnoverLakh}
              disabled={loading}
            />
          </Field>

          <div className="flex items-center h-full pt-6">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[--text-sm] font-medium text-[--vc-text-primary]">
              <input
                type="checkbox"
                name="isFoodBusiness"
                checked={formData.isFoodBusiness}
                onChange={handleChange}
                disabled={loading}
                className="rounded border-[--vc-border] text-[--vc-brand] focus:ring-[--vc-brand]"
              />
              <span>Is this a Food Business? (Requires FSSAI license)</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-[--vc-border]">
          <Button type="submit" variant="primary" loading={loading} className="w-full py-2.5">
            {isEdit ? 'Save Profile Changes' : 'Complete Setup & Sync Compliance'}
          </Button>
        </div>
      </form>
    </div>
  );
}
