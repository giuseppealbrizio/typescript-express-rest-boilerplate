declare module 'validator' {
  const value: Function;
  const isEmail: Function;
  const isURL: Function;

  export default { value, isEmail, isURL };
}
