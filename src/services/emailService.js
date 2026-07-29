const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: false,
  auth: {
    user: env.smtp.user,
    pass: env.smtp.pass,
  },
});

function forgottenPasswordEmail(email, tempPassword, name) {
  const ref = `MDT-${Date.now().toString(36).toUpperCase()}`;
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  return {
    from: `"Schollarship" <${env.smtp.from}>`,
    to: email,
    subject: 'Votre mot de passe temporaire',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <base target="_blank">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e0e0e0">

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:2px solid #0F1728">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="width:36px;height:36px;background:#0F1728;border-radius:8px;text-align:center;vertical-align:middle">
                          <span style="color:#fff;font-size:16px;font-weight:800;font-family:Inter,sans-serif">S</span>
                        </td>
                        <td style="padding-left:10px;vertical-align:middle">
                          <span style="color:#0F1728;font-size:16px;font-weight:700;letter-spacing:-0.3px">SCHOLARSHIP</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td style="text-align:right;vertical-align:middle">
                    <span style="color:#6B7A99;font-size:11px;text-transform:uppercase;letter-spacing:0.5px">Mot de passe temporaire</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Ref / Date / Destinataire -->
          <tr>
            <td style="padding:24px 32px 20px">
              <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
                <tr>
                  <td style="padding:4px 0">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:120px;color:#6B7A99;font-size:12px">R\u00e9f\u00e9rence</td>
                        <td style="color:#0F1728;font-size:13px;font-weight:600;font-family:monospace">${ref}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:120px;color:#6B7A99;font-size:12px">Date d'\u00e9mission</td>
                        <td style="color:#0F1728;font-size:13px">${date}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="width:120px;color:#6B7A99;font-size:12px">Destinataire</td>
                        <td style="color:#0F1728;font-size:13px">${name ? `${name} &lt;${email}&gt;` : email}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Separator -->
          <tr>
            <td style="padding:0 32px"><div style="height:1px;background:#e8e8e8"></div></td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:20px 32px 16px">
              <p style="margin:0 0 16px;color:#0F1728;font-size:14px;line-height:1.6">
                Une demande de r\u00e9initialisation de mot de passe a \u00e9t\u00e9 enregistr\u00e9e pour votre compte. Voici vos identifiants temporaires\u00a0:
              </p>

              <!-- Password framed like invoice amount -->
              <table cellpadding="0" cellspacing="0" width="100%" style="border:1px solid #d0d0d0;border-collapse:collapse">
                <tr>
                  <td style="padding:0">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:10px 16px;background:#fafafa;border-bottom:1px solid #e8e8e8">
                          <span style="color:#6B7A99;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Mot de passe temporaire</span>
                        </td>
                        <td style="padding:10px 16px;background:#fafafa;border-bottom:1px solid #e8e8e8;text-align:right">
                          <span style="display:inline-block;padding:1px 8px;background:#0F1728;color:#fff;font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Unique</span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:16px;text-align:center">
                          <code style="font-size:24px;font-weight:800;color:#0F1728;letter-spacing:3px;font-family:'SF Mono','Fira Code','Courier New',monospace">${tempPassword}</code>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:14px 0 0;color:#6B7A99;font-size:12px;line-height:1.5">
                Ce code expire apr\u00e8s la premi\u00e8re connexion. Pour des raisons de s\u00e9curit\u00e9, modifiez votre mot de passe d\u00e8s l'acc\u00e8s \u00e0 votre compte.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:8px 32px 24px">
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${env.cors.origin}/login" style="display:inline-block;background:#0F1728;color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:12px 40px;border-radius:6px">Acc\u00e9der \u00e0 mon compte</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #e8e8e8;text-align:center">
              <p style="margin:0 0 4px;color:#999;font-size:11px;line-height:1.5">
                Si vous n'\u00eates pas \u00e0 l'origine de cette demande, ignorez cet email.<br>
                Votre mot de passe actuel reste inchang\u00e9.
              </p>
              <p style="margin:12px 0 0;color:#bbb;font-size:10px">Schollarship &copy; ${new Date().getFullYear()} &mdash; Plateforme de gestion scolaire &bull; R\u00e9f. ${ref}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
}

async function sendForgotPasswordEmail(email, tempPassword, name) {
  const info = await transporter.sendMail(forgottenPasswordEmail(email, tempPassword, name));
  return info;
}

module.exports = { sendForgotPasswordEmail };