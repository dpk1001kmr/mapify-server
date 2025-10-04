function compareRequestBody(reqBody, format) {
  // const result = [];

  // const reqBodyKeys = Object.keys(reqBody);
  // const formatBodyKeys = Object.keys(formatBody);

  // console.log(reqBodyKeys);
  // console.log(formatBodyKeys);

  const result = [];

  for (const parentKey of Object.keys(format)) {
    if (!(parentKey in reqBody)) {
      result.push(`${parentKey} is not mapped properly`);
      continue;
    }

    const expectedKeys = Object.keys(format[parentKey]).sort();
    const incomingKeys = Object.keys(reqBody[parentKey]).sort();

    const isSame =
      expectedKeys.length === incomingKeys.length &&
      expectedKeys.every((key, idx) => key === incomingKeys[idx]);

    if (isSame) {
      // result.push(`${parentKey} is mapped properly`);
    } else {
      result.push(`${parentKey} is not mapped properly`);
    }
  }

  // Check for extra parent keys
  for (const parentKey of Object.keys(reqBody)) {
    if (!(parentKey in format)) {
      result.push(`${parentKey} is not expected`);
    }
  }

  return result;
}

module.exports = { compareRequestBody };
