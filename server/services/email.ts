import { MailService } from '@sendgrid/mail';
import { Receipt, Reminder, User } from '@shared/schema';

// Email service for sending notifications
export class EmailService {
  private mailService: MailService | null = null;
  private initialized: boolean = false;
  private defaultFromEmail: string = 'notifications@rentr.ca'; // Default sender email

  constructor() {
    // Initialize SendGrid if API key is available
    this.initialize();
  }

  private initialize(): void {
    try {
      if (process.env.SENDGRID_API_KEY) {
        this.mailService = new MailService();
        this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
        this.initialized = true;
        console.log('SendGrid email service initialized successfully');
      } else {
        console.log('SENDGRID_API_KEY not found. Email functionality will be simulated.');
      }
    } catch (error) {
      console.error('Failed to initialize SendGrid:', error);
    }
  }

  /**
   * Sends an email
   * @param to Recipient email
   * @param subject Email subject
   * @param text Plain text content
   * @param html HTML content
   * @returns Boolean indicating success or failure
   */
  async sendEmail(to: string, subject: string, text: string, html: string): Promise<boolean> {
    if (!this.initialized || !this.mailService) {
      // Simulate email sending in development
      console.log('Simulating email send:');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${text}`);
      return true;
    }

    try {
      await this.mailService.send({
        to,
        from: this.defaultFromEmail,
        subject,
        text,
        html,
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Sends a rent payment reminder email
   * @param reminder The reminder object
   * @param tenant The tenant user object
   * @param landlord The landlord user object
   * @param amount The amount of the payment
   * @param propertyAddress The address of the rental property
   */
  async sendRentReminder(
    reminder: Reminder, 
    tenant: User, 
    landlord: User, 
    amount: number,
    propertyAddress: string
  ): Promise<boolean> {
    const subject = `Rent Payment Reminder - Due on ${new Date(reminder.dueDate).toLocaleDateString()}`;
    
    // Build the email content
    const text = `
Hello ${tenant.firstName},

This is a friendly reminder that your rent payment of $${amount/100} is due on ${new Date(reminder.dueDate).toLocaleDateString()}.

Payment Details:
- Amount: $${amount/100}
- Due Date: ${new Date(reminder.dueDate).toLocaleDateString()}
- Property: ${propertyAddress || 'Your rental property'}

Please ensure your payment is made on time to avoid any late fees. You can make your payment through the Rentr portal or by contacting your landlord directly.

If you have any questions or concerns, please contact your landlord at ${landlord.email} or ${landlord.phoneNumber || 'through the Rentr messaging system'}.

Thank you,
The Rentr Team
`;

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #2563eb;">Rent Payment Reminder</h1>
  </div>
  
  <p>Hello ${tenant.firstName},</p>
  
  <p>This is a friendly reminder that your rent payment of <strong>$${amount/100}</strong> is due on <strong>${new Date(reminder.dueDate).toLocaleDateString()}</strong>.</p>
  
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #4b5563;">Payment Details:</h3>
    <ul>
      <li><strong>Amount:</strong> $${amount/100}</li>
      <li><strong>Due Date:</strong> ${new Date(reminder.dueDate).toLocaleDateString()}</li>
      <li><strong>Property:</strong> ${propertyAddress || 'Your rental property'}</li>
    </ul>
  </div>
  
  <p>Please ensure your payment is made on time to avoid any late fees. You can make your payment through the <a href="https://rentr.ca" style="color: #2563eb; text-decoration: none;">Rentr portal</a> or by contacting your landlord directly.</p>
  
  <p>If you have any questions or concerns, please contact your landlord at <a href="mailto:${landlord.email}" style="color: #2563eb; text-decoration: none;">${landlord.email}</a> or ${landlord.phoneNumber ? `<a href="tel:${landlord.phoneNumber}" style="color: #2563eb; text-decoration: none;">${landlord.phoneNumber}</a>` : 'through the Rentr messaging system'}.</p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Thank you,<br>The Rentr Team</p>
  </div>
</div>
`;

    return await this.sendEmail(tenant.email, subject, text, html);
  }

  /**
   * Sends a rent payment receipt email
   * @param receipt The receipt object
   * @param tenant The tenant user object
   * @param landlord The landlord user object
   */
  async sendRentReceipt(receipt: Receipt, tenant: User, landlord: User): Promise<boolean> {
    const subject = `Rent Payment Receipt - ${receipt.receiptNumber}`;
    
    // Build the email content
    const text = `
Hello ${tenant.firstName},

Thank you for your rent payment. Below is your receipt:

Receipt Number: ${receipt.receiptNumber}
Payment Date: ${new Date(receipt.paymentDate).toLocaleDateString()}
Amount: $${receipt.amount/100}
Payment Method: ${receipt.paymentMethod || 'Online payment'}
Description: ${receipt.description || 'Rent payment'}

This receipt has been generated automatically by the Rentr system. 
If you have any questions about this receipt, please contact your landlord, ${landlord.firstName} ${landlord.lastName}, at ${landlord.email} or ${landlord.phoneNumber || 'through the Rentr messaging system'}.

Thank you,
The Rentr Team
`;

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #2563eb;">Rent Payment Receipt</h1>
  </div>
  
  <p>Hello ${tenant.firstName},</p>
  
  <p>Thank you for your rent payment. Below is your receipt:</p>
  
  <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Receipt Number:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${receipt.receiptNumber}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Payment Date:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${new Date(receipt.paymentDate).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Amount:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">$${receipt.amount/100}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;"><strong>Payment Method:</strong></td>
        <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${receipt.paymentMethod || 'Online payment'}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0;"><strong>Description:</strong></td>
        <td style="padding: 8px 0; text-align: right;">${receipt.description || 'Rent payment'}</td>
      </tr>
    </table>
  </div>
  
  <p>This receipt has been generated automatically by the Rentr system.</p>
  <p>If you have any questions about this receipt, please contact your landlord, ${landlord.firstName} ${landlord.lastName}, at <a href="mailto:${landlord.email}" style="color: #2563eb; text-decoration: none;">${landlord.email}</a> or ${landlord.phoneNumber ? `<a href="tel:${landlord.phoneNumber}" style="color: #2563eb; text-decoration: none;">${landlord.phoneNumber}</a>` : 'through the Rentr messaging system'}.</p>
  
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #6b7280; font-size: 14px;">
    <p>Thank you,<br>The Rentr Team</p>
    <p><a href="https://rentr.ca" style="color: #2563eb; text-decoration: none;">www.rentr.ca</a></p>
  </div>
</div>
`;

    return await this.sendEmail(tenant.email, subject, text, html);
  }
}

// Export singleton instance
export const emailService = new EmailService();