import { ServerError } from "../../errors";
import { ErrorMessage } from "../../errors";

export type InvoiceErrorCodes =
  | "INVOICE_ALREADY_EXISTS"
  | "INVOICE_DOES_NOT_EXIST"
  | "INVOICE_NOT_FOUND"
  | "INVOICE_UPDATES_MUST_RETURN_VALUES";

export const INVOICE_ERROR_MESSAGES: ErrorMessage<InvoiceErrorCodes> = {
  INVOICE_ALREADY_EXISTS: {
    code: "INVOICE_ALREADY_EXISTS",
    stausCode: 400,
    message: "There is already an existing invoice with this invoiceId.",
  },
  INVOICE_DOES_NOT_EXIST: {
    code: "INVOICE_DOES_NOT_EXIST",
    stausCode: 400,
    message: "You cannot delete a invoice that does not exist.",
  },
  INVOICE_NOT_FOUND: {
    code: "INVOICE_NOT_FOUND",
    stausCode: 400,
    message: "Invoice item not found.",
  },
  INVOICE_UPDATES_MUST_RETURN_VALUES: {
    code: "INVOICE_UPDATES_MUST_RETURN_VALUES",
    stausCode: 500,
    message: "Invoice item updates must return all attributes of the item.",
  },
};

export class InvoiceError extends ServerError {
  code: InvoiceErrorCodes;
  constructor(code: InvoiceErrorCodes) {
    const { stausCode, message } = INVOICE_ERROR_MESSAGES[code];
    super(code, message, stausCode);
    this.code = code;
  }
}
