import MailService from '@sendgrid/mail';
import ResponseError from '@sendgrid/helpers/classes/response-error';
import { ApplicationError } from '../../errors';
import {
  IEmailObject,
  ISendgridObject,
} from '../../interfaces/email.interface';

const templates = {
  template_1: 'id_of_template',
};

export default {
  /**
   * Send a test email
   * @return {Promise<[Response<object>, {}]>}
   */
  sendTestEmail: async () => {
    try {
      MailService.setApiKey(<string>process.env.SENDGRID_API_KEY);
      const msg = {
        to: process.env.SENDGRID_SENDER_EMAIL,
        from: process.env.SENDGRID_SENDER_EMAIL,
        subject: 'This is a test email from service',
        text: 'This is a test email from service',
      };

      // @ts-ignore
      return await MailService.send(msg);
    } catch (error) {
      if (error instanceof ResponseError) {
        throw new ApplicationError(error.code, error.response.body);
      }
    }
  },
  /**
   * Send an email with dynamic template created on sendgrid
   * @param data
   * @return {Promise<[Response<object>, {}]>}
   */
  sendEmailWithDynamicTemplate: async (data: IEmailObject) => {
    const { fromEmail, toEmail, toCCEmails, templateName, dtField } = data;

    try {
      MailService.setApiKey(<string>process.env.SENDGRID_API_KEY);

      const emailObject: ISendgridObject = {
        // from: process.env.SENDGRID_SENDER_EMAIL,
        from: fromEmail,
        to: toEmail,
        cc: toCCEmails,
        subject: 'Subject of the email',
        templateId: templates[templateName as keyof typeof templates],
        dynamic_template_data: {
          dt_field_1: dtField,
        },
      };
      // @ts-ignore
      return await MailService.send(emailObject);
    } catch (error) {
      if (error instanceof ResponseError) {
        throw new ApplicationError(error.code, error.response.body);
      }
    }
  },
};
