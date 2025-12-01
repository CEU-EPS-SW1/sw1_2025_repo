/**
 * @param {string} message The message to parse.
 * @return The parsed JSON object or null.
 */

module.exports.safeParseJSON = message => {
  try {
    return JSON.parse(message)
  } catch (error) {
    return null
  }
}
