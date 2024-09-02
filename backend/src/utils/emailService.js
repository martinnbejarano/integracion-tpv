import brevo from "@getbrevo/brevo";
import { envConfig } from "./env.config.js";

const sendEmail = async (to, subject, htmlContent, params = {}) => {
  let apiInstance = new brevo.TransactionalEmailsApi();

  let apiKey = apiInstance.authentications["apiKey"];
  apiKey.apiKey = envConfig.BREVO_API_KEY; // Asegúrese de agregar esta variable de entorno

  let sendSmtpEmail = new brevo.SendSmtpEmail();

  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: "App Resto",
    email: "tomydominguez96@gmail.com",
  };
  console.log(to);
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.params = params;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email enviado exitosamente. Datos:", JSON.stringify(data));
    return data;
  } catch (error) {
    console.error("Error al enviar el email:", error);
    throw error;
  }
};

export { sendEmail };
