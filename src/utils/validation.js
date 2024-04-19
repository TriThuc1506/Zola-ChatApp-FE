// check email
export const checkEmail = (email) => {
  const re = /\S+@\S+\.\S+/;
  if (!re.test(email)) {
    return false;
  }
  return true;
};

// check password: at least 6 characters and contain at least one special character
export const checkPassword = (password) => {
  const re = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
  if (!re.test(password)) {
    return false;
  }
  return true;
};

// check phone number
export const checkPhone = (phone) => {
  const re = /^\d{10,11}$/;
  if (!re.test(phone)) {
    return false;
  }
  return true;
};

// check name : at least 2 characters and corect with vietnamese name
export const checkName = (name) => {
  const re = /^([a-zA-Zá-ỹÁ-Ỹ\s]{2,40})$/;
  if (!re.test(name)) {
    return false;
  }
  return true;
};

export const checkDOB = (dob) => {
  const dobDate = new Date(dob);
  const currentDate = new Date();

  if (dobDate >= currentDate) {
    return false;
  }

  if (
    dobDate.getMonth() === 1 &&
    dobDate.getDate() === 29 &&
    !isLeapYear(dobDate.getFullYear())
  ) {
    return false;
  }

  if (currentDate.getFullYear() - dobDate.getFullYear() < 16) {
    return false;
  }

  return true;
};

// Hàm kiểm tra năm nhuận
const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};
