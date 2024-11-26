// frontend/src/utils/calculations.js
export const calculateAmount = (quantity, unitPrice) => {
    return quantity * unitPrice;
  };
  
  export const calculateVat = (amount, vatRate = 16) => {
    return (amount * vatRate) / 100;
  };
  
  export const calculateTotal = (amount, vatRate = 16) => {
    const vat = calculateVat(amount, vatRate);
    return amount + vat;
  };