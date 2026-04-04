/**
 * dbErrorHandler — Global Express Error-Handling Middleware
 * 
 * Catches all errors forwarded via next(error) from controllers.
 * Classifies MySQL, Mongoose, and business-logic errors into
 * appropriate HTTP status codes with user-friendly messages.
 * 
 * MUST be registered AFTER all routes in server.js:
 *   app.use(dbErrorHandler);
 */

// Helper: extract the duplicated field info from MySQL ER_DUP_ENTRY message
// Example message: "Duplicate entry 'test@mail.com' for key 'accounts.email'"
const extractDupInfo = (message) => {
  const match = message.match(/Duplicate entry '(.+?)' for key '(.+?)'/);
  if (match) {
    const value = match[1];
    const rawKey = match[2]; // e.g. "accounts.email" or "PRIMARY"
    const field = rawKey.includes('.') ? rawKey.split('.').pop() : rawKey;
    return { value, field };
  }
  return null;
};

// Helper: extract the FK constraint info from MySQL ER_NO_REFERENCED_ROW / ER_ROW_IS_REFERENCED
const extractFKInfo = (message) => {
  const match = message.match(/FOREIGN KEY \(`(.+?)`\) REFERENCES `(.+?)`/);
  if (match) {
    return { field: match[1], referencedTable: match[2] };
  }
  return null;
};

// Helper: extract the column name from ER_BAD_NULL_ERROR
// Example: "Column 'email' cannot be null"
const extractNullField = (message) => {
  const match = message.match(/Column '(.+?)' cannot be null/);
  return match ? match[1] : null;
};

// Helper: extract column from ER_DATA_TOO_LONG
// Example: "Data too long for column 'username' at row 1"
const extractTooLongField = (message) => {
  const match = message.match(/Data too long for column '(.+?)'/);
  return match ? match[1] : null;
};

const dbErrorHandler = (err, req, res, _next) => {
  // Prevent sending response if headers already sent
  if (res.headersSent) {
    return _next(err);
  }

  // ──────────────────────────────────────────────
  // 1. MySQL Errors (identified by err.code string + err.errno number)
  // ──────────────────────────────────────────────
  if (err.errno && err.sqlState) {
    const logPrefix = `[DB Error] ${err.code} (${err.errno})`;

    switch (err.errno) {
      // ── Duplicate entry ──
      case 1062: {
        const dup = extractDupInfo(err.message);
        const detail = dup
          ? `The value '${dup.value}' already exists for '${dup.field}'`
          : 'A record with the same unique value already exists';
        console.warn(`${logPrefix}: ${detail}`);
        return res.status(409).json({
          success: false,
          message: 'Duplicate entry',
          detail,
        });
      }

      // ── FK referenced — cannot delete/update parent row ──
      case 1451: {
        const fk = extractFKInfo(err.message);
        const detail = fk
          ? `Cannot modify because it is referenced by '${fk.referencedTable}'`
          : 'Cannot modify because the record is referenced by other data';
        console.warn(`${logPrefix}: ${detail}`);
        return res.status(409).json({
          success: false,
          message: 'Data is in use',
          detail,
        });
      }

      // ── FK not found — referenced row does not exist ──
      case 1452: {
        const fk = extractFKInfo(err.message);
        const detail = fk
          ? `Referenced '${fk.field}' does not exist in '${fk.referencedTable}'`
          : 'A referenced record does not exist';
        console.warn(`${logPrefix}: ${detail}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid reference',
          detail,
        });
      }

      // ── Data too long ──
      case 1406: {
        const field = extractTooLongField(err.message);
        const detail = field
          ? `Value too long for field '${field}'`
          : 'One of the provided values exceeds the maximum allowed length';
        console.warn(`${logPrefix}: ${detail}`);
        return res.status(400).json({
          success: false,
          message: 'Data too long',
          detail,
        });
      }

      // ── Truncated / wrong value (e.g. bad date format, wrong ENUM) ──
      case 1265:
      case 1292: {
        console.warn(`${logPrefix}: ${err.message}`);
        return res.status(400).json({
          success: false,
          message: 'Invalid data format',
          detail: 'One of the provided values has an incorrect format or type',
        });
      }

      // ── NOT NULL violation ──
      case 1048: {
        const field = extractNullField(err.message);
        const detail = field
          ? `Field '${field}' is required and cannot be empty`
          : 'A required field is missing';
        console.warn(`${logPrefix}: ${detail}`);
        return res.status(400).json({
          success: false,
          message: 'Missing required field',
          detail,
        });
      }

      // ── No default value for field ──
      case 1364: {
        console.warn(`${logPrefix}: ${err.message}`);
        return res.status(400).json({
          success: false,
          message: 'Missing required field',
          detail: 'A required field was not provided and has no default value',
        });
      }

      // ── Lock wait timeout / deadlock ──
      case 1205:
      case 1213: {
        console.error(`${logPrefix}: ${err.message}`);
        return res.status(503).json({
          success: false,
          message: 'Service temporarily unavailable',
          detail: 'The server is busy, please try again in a moment',
        });
      }

      // ── Table or column does not exist (schema issues) ──
      case 1146:
      case 1054: {
        console.error(`${logPrefix}: ${err.message}`);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }

      // ── Stored procedure does not exist ──
      case 1305: {
        console.error(`${logPrefix}: ${err.message}`);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
        });
      }

      // ── Other MySQL errors — log and return 500 ──
      default: {
        console.error(`${logPrefix} [Unhandled MySQL]: ${err.message}`);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }
    }
  }

  // ──────────────────────────────────────────────
  // 2. Mongoose Validation Errors
  // ──────────────────────────────────────────────
  if (err.name === 'ValidationError') {
    const fields = Object.keys(err.errors);
    const details = fields.map((f) => ({
      field: f,
      message: err.errors[f].message,
    }));
    console.warn(`[Mongoose ValidationError]: ${JSON.stringify(details)}`);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      detail: details,
    });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    console.warn(`[Mongoose CastError]: ${err.message}`);
    return res.status(400).json({
      success: false,
      message: 'Invalid data format',
      detail: `Invalid value for '${err.path}': ${err.value}`,
    });
  }

  // Mongoose duplicate key (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {}).join(', ');
    console.warn(`[Mongoose DupKey]: field=${field}`);
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry',
      detail: `A record with the same '${field}' already exists`,
    });
  }

  // ──────────────────────────────────────────────
  // 3. Fallback — Unknown / unhandled errors
  // ──────────────────────────────────────────────
  console.error('[Unhandled Error]:', err.stack || err.message || err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};

export default dbErrorHandler;
