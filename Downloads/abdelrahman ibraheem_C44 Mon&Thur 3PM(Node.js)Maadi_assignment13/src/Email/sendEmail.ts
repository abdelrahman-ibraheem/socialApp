import nodemailer from 'nodemailer';
export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {

const transporterOptions = {
  host: process.env.host,
  port: process.env.EmailPort ? Number(process.env.EmailPort) : 465,
  secure: true,
  service: "gmail",
  auth: {
    user: process.env.user,
    pass: process.env.pass,
  },
};

const transporter = nodemailer.createTransport(transporterOptions);

    const main = await transporter.sendMail({
      from:` SOCIALAPP <${process.env.user}>`,
      to,
      subject,
      html,
    });
    console.log(main.messageId);
    
  }
