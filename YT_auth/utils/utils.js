export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpHTML(otp) {
  return `
    
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTP Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:40px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" 
              style="background:#111827; padding:30px;">
              <h1 style="color:#ffffff; margin:0; font-size:28px;">
                Streak Up
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px; color:#333333;">

              <h2 style="margin-top:0; font-size:24px;">
                Verify Your Email
              </h2>

              <p style="font-size:16px; line-height:1.6; color:#555555;">
                Hello,
              </p>

              <p style="font-size:16px; line-height:1.6; color:#555555;">
                Use the following OTP code to verify your account.
                This OTP is valid for <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="text-align:center; margin:35px 0;">
                <span style="
                  display:inline-block;
                  background:#f3f4f6;
                  padding:18px 40px;
                  font-size:36px;
                  font-weight:bold;
                  letter-spacing:10px;
                  color:#111827;
                  border-radius:10px;
                  border:2px dashed #d1d5db;
                ">
                  ${otp}
                </span>
              </div>

              <p style="font-size:15px; line-height:1.6; color:#666666;">
                If you did not request this code, you can safely ignore this email.
              </p>

              <p style="font-size:15px; line-height:1.6; color:#666666; margin-top:30px;">
                Thanks,<br />
                <strong>Streak Up Team</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" 
              style="background:#f9fafb; padding:20px; font-size:13px; color:#9ca3af;">
              © 2026 Streak Up. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>

    `;
}
