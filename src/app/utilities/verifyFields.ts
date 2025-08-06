export const verifyFields = (fields: any[], providedFields: any) => {
  // Check for invalid fields
  const invalidFields = providedFields.filter((field: any) => !fields.includes(field));
  if (invalidFields.length > 0) {
    return {
      error: true,
      message: `Invalid fields: ${invalidFields.join(', ')}`
    };
  }

  // Check for missing required fields
  const missingFields = fields.filter(field => !providedFields.includes(field));
  if (missingFields.length > 0) {
    return {
      error: true,
      message: `Missing required fields: ${missingFields.join(', ')}`
    };
  }

  return {
    error: false,
    message: 'All fields are valid and present.'
  };
};
