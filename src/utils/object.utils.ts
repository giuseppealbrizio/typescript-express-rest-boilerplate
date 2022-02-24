/**
 * Create an object composed of the picked object properties
 * @param {Object} object
 * @param {string[]} keys
 * @returns {Object}
 */
export const composeObject = (object: object, keys: any) => {
  return keys.reduce((obj: any, key: any) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // @ts-ignore
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

/**
 * Clean an object when some values are undefined, null, etc..
 * @param obj
 */
export const cleanObject = (obj: object) => {
  return (
    Object.entries(obj)
      // eslint-disable-next-line no-unused-vars
      .filter(([_, v]) => v != null)
      .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
  );
};

/**
 * Clean an object when some values are undefined, null, etc.. recursively
 * @param obj
 */
export const cleanObjectWithRecursion = (obj: object) => {
  return (
    Object.entries(obj)
      // eslint-disable-next-line no-unused-vars
      .filter(([_, v]) => v != null)
      .reduce(
        (acc, [k, v]) => ({
          ...acc,
          [k]: v === Object(v) ? cleanObject(v) : v,
        }),
        {},
      )
  );
};

/**
 * Checks if an object is empty (returns boolean)
 * @param obj
 * @returns {boolean}
 */
export const isObjEmpty = (obj: object) => Object.keys(obj).length === 0;

/**
 * ES2019 Style
 */

// export const cleanObject = (obj) => {
//   return Object.fromEntries(
//     // eslint-disable-next-line no-unused-vars
//     Object.entries(obj).filter(([_, v]) => v != null),
//   );
// };

// export const cleanObjectWithRecursion = (obj) => {
//   return Object.fromEntries(
//     Object.entries(obj)
//       // eslint-disable-next-line no-unused-vars
//       .filter(([_, v]) => v != null)
//       .map(([k, v]) => [k, v === Object(v) ? cleanObject(v) : v]),
//   );
// };
