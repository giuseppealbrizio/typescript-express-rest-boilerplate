/**
 * SENDGRID OBJECT SHAPE
 * - interface used to pass data to sendgrid library
 */
export interface ISendgridObject {
  from: string;
  to: string;
  subject: string;
  cc: string;
  templateId?: string;
  dynamic_template_data: { [key: string]: string };
}

/**
 * EMAIL INTERFACE
 * - interface used to annotate email data to pass to sendgrid library later
 */
export interface IEmailObject {
  fromEmail: string;
  toEmail: string;
  toCCEmails: string;
  templateName: string;
  dtField: string;
}
