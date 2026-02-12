/**
 * Registration dropdown options: countries, states, institutions.
 * Align with live website dropdowns. Uses static lists; optional API can be added later.
 */
export interface OptionItem {
  value: string;
  label: string;
}

/** Indian states and UTs (alphabetical). */
export const STATES: OptionItem[] = [
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' },
  { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
  { value: 'Ladakh', label: 'Ladakh' },
  { value: 'Lakshadweep', label: 'Lakshadweep' },
  { value: 'Puducherry', label: 'Puducherry' },
];

/** Countries (India first, then common). */
export const COUNTRIES: OptionItem[] = [
  { value: 'India', label: 'India' },
  { value: 'Afghanistan', label: 'Afghanistan' },
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'Bhutan', label: 'Bhutan' },
  { value: 'Nepal', label: 'Nepal' },
  { value: 'Pakistan', label: 'Pakistan' },
  { value: 'Sri Lanka', label: 'Sri Lanka' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'United Arab Emirates', label: 'United Arab Emirates' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Japan', label: 'Japan' },
  { value: 'China', label: 'China' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Other', label: 'Other' },
];

/** Institutions (GuruSetu / IITM context; include Other). */
export const INSTITUTIONS: OptionItem[] = [
  { value: 'IIT Madras', label: 'IIT Madras' },
  { value: 'IIT Bombay', label: 'IIT Bombay' },
  { value: 'IIT Delhi', label: 'IIT Delhi' },
  { value: 'IIT Kanpur', label: 'IIT Kanpur' },
  { value: 'IIT Kharagpur', label: 'IIT Kharagpur' },
  { value: 'IIT Roorkee', label: 'IIT Roorkee' },
  { value: 'IIT Guwahati', label: 'IIT Guwahati' },
  { value: 'IIT Hyderabad', label: 'IIT Hyderabad' },
  { value: 'IIT BHU', label: 'IIT BHU' },
  { value: 'NIT Trichy', label: 'NIT Trichy' },
  { value: 'NIT Warangal', label: 'NIT Warangal' },
  { value: 'BITS Pilani', label: 'BITS Pilani' },
  { value: 'IIIT Hyderabad', label: 'IIIT Hyderabad' },
  { value: 'Anna University', label: 'Anna University' },
  { value: 'JNU', label: 'JNU' },
  { value: 'University of Delhi', label: 'University of Delhi' },
  { value: 'School / College', label: 'School / College' },
  { value: 'Other', label: 'Other' },
];
