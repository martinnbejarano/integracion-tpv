import { envConfig } from "./env.config.js";

export const getVerificationEmailTemplate = (verificationToken) => {
  const verificationLink = `${envConfig.APP_URL}/verify-email/${verificationToken}`;
  return `
    <html>
      <body>
        <h1>Bienvenido a nuestra aplicación</h1>
        <p>Por favor, haga clic en el siguiente enlace para verificar su correo electrónico:</p>
        <a href="${verificationLink}">Verificar correo electrónico</a>
        <p>Este enlace expirará en 24 horas.</p>
      </body>
    </html>
  `;
};

export const getPasswordResetEmailTemplate = (resetToken) => {
  const resetUrl = `${envConfig.APP_URL}/reset-password/${resetToken}`;
  return `
    <html>
      <body>
        <h1>Restablecimiento de contraseña</h1>
        <p>Haga clic en el siguiente enlace para restablecer su contraseña:</p>
        <a href="${resetUrl}">Restablecer contraseña</a>
        <p>Este enlace expirará en 1 hora.</p>
      </body>
    </html>
  `;
};

export const getPasswordResetConfirmationTemplate = () => {
  return `
    <html>
      <body>
        <h1>Su contraseña ha sido restablecida exitosamente</h1>
        <p>Si usted no realizó este cambio, por favor contacte a soporte inmediatamente.</p>
      </body>
    </html>
  `;
};

export const getAccountDeletionRequestTemplate = () => {
  return `
    <html>
      <body>
        <h1>Solicitud de eliminación de cuenta recibida</h1>
        <p>Su cuenta será eliminada en 30 días. Si desea cancelar esta solicitud, por favor inicie sesión en su cuenta.</p>
      </body>
    </html>
  `;
};

export const getAccountDeletionCancellationTemplate = () => {
  return `
    <html>
      <body>
        <h1>Solicitud de eliminación de cuenta cancelada</h1>
        <p>Su solicitud de eliminación de cuenta ha sido cancelada exitosamente. Su cuenta permanecerá activa.</p>
      </body>
    </html>
  `;
};
