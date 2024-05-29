export default function formatPhoneNumber(phoneNumber) {
  // Remove all non-numeric characters
  const cleaned = (`${phoneNumber}`).replace(/\D/g, '');

  // Check if the input is of correct length
  if (cleaned.length === 10) {
    // Group the numbers appropriately
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  } else if (cleaned.length === 11 && cleaned.charAt(0) === '1') {
    // Check for and handle country code 1
    const match = cleaned.match(/^1(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
  }

  // Return the cleaned input if it doesn't match any format
  return phoneNumber;
}
