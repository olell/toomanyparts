export const getApiEndpoint = (path, prefix = "/api") => {
  /**
   * Returns the absolute url of an API endpoint
   */
  return (
    (process.env.NODE_ENV === "production"
      ? window.location.protocol + "//" + window.location.host
      : "http://localhost:3279") +
    prefix +
    path
  );
};
